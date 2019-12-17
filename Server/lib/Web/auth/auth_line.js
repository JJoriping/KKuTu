const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-line').Strategy,
    color: '#1EC800',
    fontColor: '#FFFFFF',
    vendor: 'line',
    displayName: 'withLine'
}

module.exports.strategyConfig = {
    channelID: config.line.clientID,
    channelSecret: config.line.clientSecret,
    callbackURL: config.line.callbackURL,
    passReqToCallback: true,
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        // var fullname = profile.username+"#"+profile.discriminator;

        $p.authType = "line";
        $p.id = $p.authType+"-"+profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = profile.avatar;

        process(req, accessToken, MainDB, $p, done);
    }
}
