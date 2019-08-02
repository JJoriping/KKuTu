const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-spotify').Strategy,
    color: '#1ED760',
    fontColor: '#000000',
    vendor: 'spotify',
    displayName: 'withSpotify'
}

module.exports.strategyConfig = {
    clientID: config.spotify.clientID,
    clientSecret: config.spotify.clientSecret,
    callbackURL: config.spotify.callbackURL,
    passReqToCallback: true
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};
		
		// var fullname = profile.username+"#"+profile.discriminator;

        $p.authType = "spotify";
        $p.id = $p.authType+"-"+profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = profile._json.profile_image;

        process(req, accessToken, MainDB, $p, done);
    }
}