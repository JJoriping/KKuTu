const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-twitter').Strategy,
    color: '#55ACEE',
    fontColor: '#FFFFFF',
    vendor: 'twitter',
    displayName: 'withTwitter'
}

module.exports.strategyConfig = {
    consumerKey: config.twitter.consumerKey,  // 보안을 위해서입니다.
    consumerSecret: config.twitter.consumerSecret, // 이 방법을 사용하는 것을
    callbackURL: config.twitter.callbackURL, // 적극 권장합니다.
    passReqToCallback: true
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.authType = "twitter";
        $p.id = profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = profile.photos[0].value;

        process(req, accessToken, MainDB, $p, done);
    }
}