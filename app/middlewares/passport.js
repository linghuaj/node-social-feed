let passport = require('passport')
    // let LocalStrategy = require('passport-local').Strategy
let FacebookStrategy = require('passport-facebook').Strategy
let TwitterStrategy = require('passport-twitter').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')


//TODO: load from indexjs and pass in from function instead
// let configAuth = require('../../config/auth').dev


require('songbird')

function useExternalPassportStrategy(OauthStrategy, config, accountType) {
    config.passReqToCallback = true

    passport.use(new OauthStrategy(config, nodeifyit(authCB, {
        spread: true
    })))
    console.log("><strategy", accountType)

    async
    function authCB(req, token, _ignored_, account) {
        let accountID = account.id
        let user = await User.promise.findOne({
                 'twitter.id': accountID
             })
            // try {
            //   user  = User.promise.find({
            //         accountID
            //     })
            // } catch (e) {
            //     console.log(">e", e)
            // }
        if (!user) {
            user = new User({})
        }
        user.twitter = {
            id: accountID,
            token: token,
            secret: _ignored_,
            name: account.displayName
        }

        return await user.save()
            // Your generic 3rd-party passport strategy implementation here
            // Use account.id to Load the user from the database (e.g., user.facebook.id)
            // If req.user exists, the user is adding an account (authorization): 
            // Validate req.user.facebook.id equals user.facebook.id
            // Store the Facebook user data in account in user.facebook
            // 
            // else
            // Create the user if none loaded from the database
            // link the account to user
    }
}


function configure(configAuth) {
    // Required for session support / persistent login sessions
    passport.serializeUser(nodeifyit(async(user) => user.id))
    passport.deserializeUser(nodeifyit(async(id) => {
        return await User.promise.findById(id)
    }))


    useExternalPassportStrategy(FacebookStrategy, {
        clientID: configAuth.facebook.consumerKey,
        clientSecret: configAuth.facebook.consumerSecret,
        callbackURL: configAuth.facebook.callbackUrl
    }, 'facebook')
    console.log("configAuth", configAuth.twitter)

    useExternalPassportStrategy(TwitterStrategy, {
        consumerKey: configAuth.twitter.consumerKey,
        consumerSecret: configAuth.twitter.consumerSecret,
        callbackURL: configAuth.twitter.callbackUrl
    }, 'twitter')



    // useExternalPassportStrategy(LinkedInStrategy, {...}, 'linkedin')
    // useExternalPassportStrategy(LinkedInStrategy, {...}, 'facebook')
    // useExternalPassportStrategy(LinkedInStrategy, {...}, 'google')
    // useExternalPassportStrategy(LinkedInStrategy, {...}, 'twitter')
    // passport.use('local-login', new LocalStrategy({...}, (req, email, password, callback) => {...}))
    // passport.use('local-signup', new LocalStrategy({...}, (req, email, password, callback) => {...}))

    return passport
}


module.exports = {
    passport, configure
}