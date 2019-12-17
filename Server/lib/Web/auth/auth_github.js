const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-github').Strategy,
    color: '#B6B9BD',
    fontColor: '#000000',
    vendor: 'github',
    displayName: 'withGithub'
}

module.exports.strategyConfig = {
    clientID: config.github.clientID, // 보안을 위해서입니다.
    clientSecret: config.github.clientSecret, // 이 방법을 사용하는 것을
    callbackURL: config.github.callbackURL, // 적극 권장합니다.
    passReqToCallback: true,
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        // var fullname = profile.username+"#"+profile.discriminator;

        $p.authType = "github";
        $p.id = $p.authType+"-"+profile.id;
        $p.name = profile.username;
        $p.title = profile.username;
        $p.image = profile.avatar;

        process(req, accessToken, MainDB, $p, done);
    }
}