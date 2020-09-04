const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-daldalso').Strategy,
    color: '#0F132F',
    fontColor: '#FFFFFF',
    vendor: 'daldalso',
    displayName: 'withDaldalso'
}
module.exports.strategyConfig = {
    clientID: config.daldalso.clientID, // 보안을 위해서입니다.
    clientSecret: config.daldalso.clientSecret, // 이 방법을 사용하는 것을
    callbackURL: config.daldalso.callbackURL, // 적극 권장합니다.
    passReqToCallback: true
}

module.exports.strategy = (strategyProcess, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};
		
		// this part will be public later
    }
}