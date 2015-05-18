let _ = require('lodash')
let Twitter = require('twitter')
let then = require('express-then')
let isLoggedIn = require('./middlewares/isLoggedIn')
let posts = require('../data/posts')

let networks = {
    twitter: {
        icon: 'facebook',
        name: 'Facebook',
        class: 'btn-primary'
    }
}

module.exports = (app) => {
    let passport = app.passport
        // Scope specifies the desired data fields from the user account
    let scope = 'email'
    let twitterConfig = app.config.auth.twitter
    app.get('/', (req, res) => res.render('index.ejs'))

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    })

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.get('/login', (req, res) => {
        res.render('login.ejs', {
            message: req.flash('error')
        })
    })

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {
            message: req.flash('error')
        })
    })

    //TODO: addback isloggin

    app.get('/timeline', then(async(req, res) => {
        try {
            console.log(">< in timeline")

            let twitterClient = new Twitter({
                consumer_key: twitterConfig.consumerKey,
                consumerSecret: twitterConfig.consumerSecret,
                access_token_key: '985869984-07pwtBNMg3munMUwDHgpN3Fs2XJhYD76c4iHKJ2r', //req.user.twitter.token,
                access_token_secret: 'cIoSBlVzzoM1g3RTyYDLnBv4HNAxXy3QvjTxCtUyjoAsS' //req.user.twitter.secret
            })
            let [tweets, ] = await twitterClient.promise.get('/statuses/home_timeline')
            tweets = tweets.map(tweet => {
                return {
                    id: tweet.id,
                    image: tweet.user.profile_image_url,
                    text: tweet.text,
                    name: tweet.user.name,
                    username: "@" + tweet.user.screen_name,
                    liked: tweet.favorited,
                    network: networks.twitter
                }
            })
            console.log(">< tweets", JSON.stringify(tweets))
            res.render('timeline.ejs', {
                posts: posts
            })
        } catch (e) {
            console.log(e)
        }
    }))




    // Authentication route & Callback URL
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope
    }))
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }))

    // Authorization route & Callback URL
    app.get('/connect/facebook', passport.authorize('facebook', {
        scope
    }))
    app.get('/connect/facebook/callback', passport.authorize('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }))
}