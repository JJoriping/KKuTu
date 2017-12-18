const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-google-oauth2').Strategy,
    color: '#FFFFFF',
    fontColor: '#000000',
    vendor: 'google',
    displayName: 'withGoogle'
}

module.exports.strategyConfig = {
    clientID: config.google.clientID, // 보안을 위해서입니다.
    clientSecret: config.google.clientSecret, // 이 방법을 사용하는 것을
    callbackURL: config.google.callbackURL, // 적극 권장합니다.
    passReqToCallback: true,
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/plus.login']
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.authType = "google";
        $p.id = profile.id;
        $p.name = (profile.name.familyName != '' ? profile.name.familyName+' ' : '')+profile.name.givenName;
        $p.title = profile.nickname;
        $p.image = profile.photos[0].value;

        process(req, accessToken, MainDB, $p, done);
    }
}