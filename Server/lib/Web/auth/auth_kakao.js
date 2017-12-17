const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-kakao').Strategy,
    color: '#FFDE00',
    fontColor: '#3C1E1E',
    vendor: 'kakao',
    displayName: 'withKakao'
}

module.exports.strategyConfig = {
    clientID: config.kakao.clientID,
    callbackURL: config.kakao.callbackURL,
    passReqToCallback: true
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.authType = "kakao";
        $p.id = profile.id.toString();
        $p.name = +profile.username;
        $p.title = profile.displayName;
        $p.image = profile._json.properties.profile_image;

        process(req, accessToken, MainDB, $p, done);
    }
}