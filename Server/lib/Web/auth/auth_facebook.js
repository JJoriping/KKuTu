const config = require('../../sub/auth.json');

module.exports.config = {
    strategy: require('passport-facebook').Strategy, // example: naver, require strategy
    color: '#235EE3', // example: #1EC800
    fontColor: '#FFFFFF', //example: #FFFFFF
    vendor: 'facebook', // example: naver
    displayName: 'withFacebook'
}

module.exports.strategyConfig = {
    clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id' ,'name' , 'gender', 'age_range', 'displayName'],
        passReqToCallback: true
}

module.exports.strategy = (process, MainDB, Ajae) => {
    return (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.authType = "facebook";
        $p.id = profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = "https://graph.facebook.com/"+profile.id+"/picture";

        /* 망할 셧다운제
        
        $p._age = profile.age_range;
        if(profile.birthday){
            $p.birth = doc.birthday.split('/').map(Number);
        }
        $p.isAjae = Ajae($p.birth, $p._age);
        */
        // $p.sex = profile.gender;
    
        process(req, accessToken, MainDB, $p, done);
    }
}