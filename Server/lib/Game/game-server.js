/**
 * Unified in-process game server for single-process / Vercel deployment.
 * Combines master + slave into a single process using EventEmitter IPC,
 * and attaches the WebSocket server to the existing HTTP server.
 *
 * Usage in main.js DB.ready:
 *   gameServer.init(DB);
 *   var httpServer = http.createServer(expressApp);
 *   gameServer.attach(httpServer);
 *   httpServer.listen(port);
 */

var EventEmitter = require('events');
var WS = require('ws');
var KKuTu = require('./kkutu');
var master = require('./master');
var GLOBAL = require('../sub/global');
var Const = require('../const');
var JLog = require('../sub/jjlog');

KKuTu.setUnifiedMode();

// Share DIC/ROOM/DNAME with master.js (same object references created at module load)
var DIC = master.DIC;
var ROOM = master.ROOM;
var DNAME = master.DNAME;
var SIDMAP = {}; // sessionId -> KKuTu.Client
var MainDB;

// EventEmitter-based IPC replacing cluster process.send / Cluster.on('message')
var ipc = new EventEmitter();
ipc.setMaxListeners(50);

// Override process.send to route IPC messages through EventEmitter
if(typeof process.send !== 'function') {
    process.send = function(msg) {
        if(msg && msg.type) ipc.emit(msg.type, msg);
    };
}

// IPC event handlers
ipc.on('kick', function(msg) {
    if(DIC[msg.target]) DIC[msg.target].socket.close();
});

ipc.on('invite', function(msg) {
    var target = DIC[msg.target];
    if(!target || target.place != 0) {
        if(DIC[msg.id]) DIC[msg.id].send('error', { code: 417 });
        return;
    }
    if(target._invited) {
        if(DIC[msg.id]) DIC[msg.id].send('error', { code: 419 });
        return;
    }
    target._invited = msg.place;
    target.send('invited', { from: msg.place });
});

ipc.on('room-expired', function(msg) {
    if(msg.create && ROOM[msg.id]) {
        ROOM[msg.id].players.forEach(function(pid) {
            if(DIC[pid]) DIC[pid].send('roomStuck');
        });
        delete ROOM[msg.id];
    }
});

ipc.on('room-invalid', function(msg) {
    if(msg.room) delete ROOM[msg.room.id];
});

ipc.on('user-publish', function(msg) {
    if(DIC[msg.data.id]) {
        for(var k in msg.data) DIC[msg.data.id][k] = msg.data[k];
    }
});

// No-ops in unified mode (handled inline or bypassed)
ipc.on('room-come', function() {});
ipc.on('room-spectate', function() {});
ipc.on('room-go', function(msg) { if(msg.removed) delete ROOM[msg.id]; });
ipc.on('room-new', function() {});
ipc.on('room-publish', function() {});
ipc.on('tail-report', function() {});
ipc.on('admin', function() {});
ipc.on('okg', function() {});

// Fake CHAN — simulates cluster workers receiving room-reserve messages
var CHAN = (function() {
    function makeChan() {
        return {
            send: function(msg) {
                if(msg.type === 'room-reserve') {
                    handleRoomReserve(msg);
                } else if(msg.type === 'room-invalid') {
                    if(msg.room) delete ROOM[msg.room.id];
                }
            }
        };
    }
    return { 0: makeChan() };
}());

function handleRoomReserve(msg) {
    setImmediate(function() {
        var $c = SIDMAP[msg.session];
        if(!$c) {
            JLog.warn('room-reserve: no client for session ' + msg.session);
            return;
        }

        var $room;
        if(msg.create) {
            var roomData = msg.room;
            if(roomData._id) { roomData.id = roomData._id; delete roomData._id; }
            $room = new KKuTu.Room(roomData, 0);
            ROOM[$room.id] = $room;
            $room.come($c);
        } else {
            $room = ROOM[msg.room.id];
            if(!$room) { $c.sendError(430, msg.room.id); return; }
            if(!msg.pass) {
                if($room.kicked.indexOf($c.id) != -1) { $c.sendError(406); return; }
                if($room.password && $room.password != msg.room.password) { $c.sendError(403); return; }
            }
            if(msg.spec) {
                $room.spectate($c, msg.pass);
            } else {
                $room.come($c, msg.room.password, msg.pass);
            }
        }

        if($c.place) {
            $c.publish('connRoom', { user: $c.getData() });
        }
    });
}

exports.getSeek = function() {
    return Object.keys(DIC).length;
};

// Called from main.js's DB.ready BEFORE httpServer is created
exports.init = function(db) {
    MainDB = db;
    MainDB.users.update(['server', "0"]).set(['server', ""]).on();
    KKuTu.init(MainDB, DIC, ROOM, master.GUEST_PERMISSION, CHAN);
    JLog.success('Unified game server initialized.');
};

// Called from main.js's DB.ready AFTER httpServer is created
exports.attach = function(httpServer) {
    var wss = new WS.Server({ noServer: true });

    httpServer.on('upgrade', function(req, socket, head) {
        if(req.url && req.url.startsWith('/game/')) {
            wss.handleUpgrade(req, socket, head, function(ws) {
                wss.emit('connection', ws, req);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', function(ws, req) {
        // URL format: /game/0/<sessionId>
        var parts = req.url.split('/');
        var sessionId = parts[3] || parts[2];

        if(!sessionId) { ws.close(); return; }

        ws.on('error', function(err) {
            JLog.warn('WS error for session ' + sessionId + ': ' + err.toString());
        });

        if(Object.keys(DIC).length >= Const.KKUTU_MAX) {
            ws.send(JSON.stringify({ type: 'error', code: 'full' }));
            ws.close();
            return;
        }

        MainDB.session.findOne(['_id', sessionId]).limit(['profile', true]).on(function($body) {
            var $c = new KKuTu.Client(ws, $body ? $body.profile : null, sessionId);
            $c.admin = GLOBAL.ADMIN.indexOf($c.id) != -1;
            $c.remoteAddress = req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '';
            $c.passRecaptcha = true;

            SIDMAP[sessionId] = $c;

            if(DIC[$c.id]) {
                DIC[$c.id].send('error', { code: 408 });
                DIC[$c.id].socket.close();
            }

            $c.refresh().then(function(ref) {
                if(ref.result == 200) {
                    DIC[$c.id] = $c;
                    DNAME[($c.profile.title || $c.profile.name).replace(/\s/g, '')] = $c.id;
                    MainDB.users.update(['_id', $c.id]).set(['server', '0']).on();

                    $c.send('welcome', {
                        id: $c.id,
                        guest: $c.guest,
                        box: $c.box,
                        playTime: $c.data ? $c.data.playTime : 0,
                        okg: $c.okgCount || 0,
                        users: KKuTu.getUserList(),
                        rooms: KKuTu.getRoomList(),
                        friends: $c.friends || {},
                        admin: $c.admin,
                        test: global.test || false,
                        caj: false
                    });

                    KKuTu.publish('conn', { user: $c.getData() });
                    JLog.info('Game connected: #' + $c.id);
                } else {
                    $c.send('error', { code: ref.result, message: ref.black });
                    $c._error = ref.result;
                    ws.close();
                }
            });
        });
    });

    KKuTu.onClientClosed = function($c) {
        delete DIC[$c.id];
        if($c.sid) delete SIDMAP[$c.sid];
        if($c._error != 409) MainDB.users.update(['_id', $c.id]).set(['server', '']).on();
        if($c.profile) delete DNAME[($c.profile.title || $c.profile.name).replace(/\s/g, '')];
        if($c.socket) $c.socket.removeAllListeners();
        KKuTu.publish('disconn', { id: $c.id });
        JLog.alert('Game disconnected: #' + $c.id);
    };

    // Wrap KKuTu.onClientMessage (set by master.js at require-time) to add
    // slave-side message types (leave, ready, start, practice, etc.)
    var masterMsg = KKuTu.onClientMessage;
    KKuTu.onClientMessage = function($c, msg) {
        if(!msg) return;
        var temp;

        switch(msg.type) {
            case 'talk':
                if(!msg.value || !msg.value.substr) return;
                if(!master.GUEST_PERMISSION.talk) if($c.guest) { $c.send('error', { code: 401 }); return; }
                msg.value = msg.value.substr(0, 200);
                if(msg.relay) {
                    var room = $c.subPlace ? $c.pracRoom : ROOM[$c.place];
                    if(!room || !room.gaming) return;
                    if(room.game.late) { $c.chat(msg.value); }
                    else if(!room.game.loading) { room.submit($c, msg.value, msg.data); }
                } else {
                    masterMsg($c, msg);
                }
                break;
            case 'leave':
                if(!$c.place) return;
                $c.leave();
                break;
            case 'ready':
                if(!$c.place) return;
                if(!master.GUEST_PERMISSION.ready) if($c.guest) return;
                $c.toggle();
                break;
            case 'start':
                if(!$c.place || !ROOM[$c.place] || ROOM[$c.place].gaming) return;
                if(!master.GUEST_PERMISSION.start) if($c.guest) return;
                $c.start();
                break;
            case 'practice':
                if(!ROOM[$c.place] || ROOM[$c.place].gaming) return;
                if(!master.GUEST_PERMISSION.practice) if($c.guest) return;
                if(isNaN(msg.level = Number(msg.level))) return;
                if(ROOM[$c.place].rule && ROOM[$c.place].rule.ai) {
                    if(msg.level < 0 || msg.level >= 5) return;
                } else if(msg.level != -1) return;
                $c.practice(msg.level);
                break;
            case 'invite':
                if(!ROOM[$c.place] || ROOM[$c.place].gaming) return;
                if(ROOM[$c.place].master != $c.id) return;
                if(!master.GUEST_PERMISSION.invite) if($c.guest) return;
                if(msg.target == 'AI') {
                    ROOM[$c.place].addAI($c);
                } else {
                    temp = DIC[DNAME[msg.target]] || DIC[msg.target];
                    if(!temp) { $c.sendError(417); break; }
                    if(temp.place != 0) { $c.sendError(417); break; }
                    if(temp._invited) { $c.sendError(419); break; }
                    temp._invited = $c.place;
                    temp.send('invited', { from: $c.place });
                }
                break;
            case 'form':
                if(!msg.mode || !ROOM[$c.place]) return;
                if(master.ENABLE_FORM.indexOf(msg.mode) == -1) return;
                $c.setForm(msg.mode);
                break;
            case 'team':
                if(!ROOM[$c.place] || ROOM[$c.place].gaming || $c.ready) return;
                if(isNaN(temp = Number(msg.value)) || temp < 0 || temp > 4) return;
                $c.setTeam(Math.round(temp));
                break;
            case 'kick':
                if(!ROOM[$c.place] || ROOM[$c.place].gaming) return;
                if(ROOM[$c.place].master != $c.id || ROOM[$c.place].kickVote) return;
                if(!master.GUEST_PERMISSION.kick) if($c.guest) return;
                if(!msg.robot) {
                    temp = DIC[msg.target];
                    if(!temp || $c.place != temp.place) return;
                    $c.kick(msg.target);
                } else {
                    $c.kick(null, msg.target);
                }
                break;
            case 'kickVote':
                temp = ROOM[$c.place];
                if(!temp || !temp.kickVote) return;
                if($c.id == temp.kickVote.target || $c.id == temp.master) return;
                if(temp.kickVote.list.indexOf($c.id) != -1) return;
                if(!master.GUEST_PERMISSION.kickVote) if($c.guest) return;
                $c.kickVote($c, msg.agree);
                break;
            case 'handover':
                temp = ROOM[$c.place];
                if(!DIC[msg.target] || !temp || temp.gaming) return;
                if($c.place != DIC[msg.target].place || temp.master != $c.id) return;
                temp.master = msg.target;
                temp.export();
                break;
            case 'wp':
                if(!msg.value) return;
                if(!master.GUEST_PERMISSION.wp) if($c.guest) { $c.send('error', { code: 401 }); return; }
                msg.value = msg.value.substr(0, 200).replace(/[^a-z가-힣]/g, '');
                if(msg.value.length < 2) return;
                break;
            case 'setAI':
                if(!msg.target || !ROOM[$c.place] || ROOM[$c.place].gaming) return;
                if(ROOM[$c.place].master != $c.id) return;
                if(isNaN(msg.level = Number(msg.level)) || msg.level < 0 || msg.level >= 5) return;
                if(isNaN(msg.team = Number(msg.team)) || msg.team < 0 || msg.team > 4) return;
                ROOM[$c.place].setAI(msg.target, Math.round(msg.level), Math.round(msg.team));
                break;
            case 'leaveRoom':
                // Unified mode: client signals room departure via fake rws.close()
                break;
            default:
                masterMsg($c, msg);
                break;
        }
    };

    JLog.success('Unified game server attached.');
};
