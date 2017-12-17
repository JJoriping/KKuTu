const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-twitter').Strategy,
    color: '#55ACEE',
    fontColor: '#FFFFFF',
    vendor: 'twitter',
    displayName: 'withTwitter'
}

module.exports.strategyConfig = { // example: naver
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL,
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