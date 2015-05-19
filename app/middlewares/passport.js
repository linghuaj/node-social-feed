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
        let queryKey = accountType + ".id"
        let user
        if (req.user) {
            user = await User.promise.findById(req.user.id)
        } else {
            //if such user exist in database for facebook or twitter
            user = await User.promise.findOne({
                queryKey: accountID
            })

        }
        // console.log("><account", account)
        console.log("><req user", req.user)

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
        user[accountType] = {
            id: accountID,
            token: token,
            secret: _ignored_,
            name: account.displayName
        }

        return await user.save()
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