/**
 * Created by horyu1234 on 2018-01-06.
 */
const JLog = require('../sub/jjlog');

let database;

exports.initDatabase = function (_database) {
    database = _database;

    JLog.info("<< KKuTu Vendor DB Migration Process :: initDatabase >>");
};

function processVendorMigration(userId) {
    let oldUserId = userId.split('-')[1];

    hasUser(oldUserId, function (result) {
        if (result) {
            modifyOldUserId(oldUserId, userId);
            JLog.info(`${oldUserId} 의 식별 번호가 ${userId} 로 마이그레이션 되었습니다.`)
        }
    });
}

function hasUser(userId, callback) {
    let query = "SELECT * " +
        "FROM users " +
        "WHERE _id = '" + userId + "';";

    database.query(query, (err, result) => {
        if (err) {
            return JLog.error(`Error executing query ${err.stack}`);
        }

        if (callback !== undefined) {
            callback(result.rows.length === 1);
        }
    })
}

function modifyOldUserId(oldUserId, userId) {
    let query = "UPDATE users " +
        "SET _id = '" + userId + "' " +
        "WHERE _id = '" + oldUserId + "';";

    database.query(query, (err) => {
        if (err) {
            return JLog.error(`Error executing query ${err.stack}`);
        }
    })
}

exports.processVendorMigration = processVendorMigration;