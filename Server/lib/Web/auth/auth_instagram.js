const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-instagram').Strategy,
    color: '#E74610',
    fontColor: '#FFFFFF',
    vendor: 'instagram',
    displayName: 'withInstagram'
}

module.exports.strategyConfig = {
    clientID: config.instagram.clientID,
    clientSecret: config.instagram.clientSecret,
    callbackURL: config.instagram.callbackURL,
    passReqToCallback: true,
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        // var fullname = profile.username+"#"+profile.discriminator;

        $p.authType = "instagram";
        $p.id = $p.authType+"-"+profile.id;
        $p.name = profile.username;
        $p.title = profile.username;
        $p.image = profile.avatar;

        process(req, accessToken, MainDB, $p, done);
    }
}