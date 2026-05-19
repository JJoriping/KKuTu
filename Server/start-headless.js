/**
 * Headless KKuTu Startup Script
 */

const Spawn = require("child_process").spawn;
const SETTINGS = require("../settings.json");
const path = require("path");

const webServer = {
    process: null,
    start: function() {
        console.log("Starting Web Server...");
        this.process = Spawn("node", [path.join(__dirname, "lib/Web/cluster.js"), SETTINGS['web-num-cpu']], {
            stdio: 'inherit',
            env: Object.assign({}, process.env, {
                KKT_SV_NAME: SETTINGS['server-name']
            })
        });
        this.process.on('exit', (code) => {
            console.log(`Web Server exited with code ${code}`);
            process.exit(code);
        });
    }
};

const gameServers = [];

function startGameServers() {
    for (let i = 0; i < SETTINGS['game-num-inst']; i++) {
        console.log(`Starting Game Server Instance ${i}...`);
        const proc = Spawn("node", [path.join(__dirname, "lib/Game/cluster.js"), i, SETTINGS['game-num-cpu']], {
            stdio: 'inherit',
            env: Object.assign({}, process.env, {
                KKT_SV_NAME: SETTINGS['server-name']
            })
        });
        proc.on('exit', (code) => {
            console.log(`Game Server Instance ${i} exited with code ${code}`);
            // If any critical component fails, we might want to kill others, but for now just log
        });
        gameServers.push(proc);
    }
}

process.on('SIGINT', () => {
    console.log("\nShutting down...");
    if (webServer.process) webServer.process.kill('SIGINT');
    gameServers.forEach(proc => proc.kill('SIGINT'));
    process.exit();
});

webServer.start();
startGameServers();
