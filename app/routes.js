let _ = require('lodash')
let Twitter = require('twitter')
let FB = require('fb')
let then = require('express-then')
let isLoggedIn = require('./middlewares/isLoggedIn')
let posts = require('../data/posts')
    // FB Utils to get permission 
    // let permission = await FB.api.promise('/me/permissions', {

//             access_token: req.user.facebook.token
//         })

let networks = {
    twitter: {
        icon: 'twitter',
        name: 'twitter',
        class: 'btn-info'
    },
    facebook: {
        icon: 'facebook',
        name: 'facebook',
        class: 'btn-primary'
    }
}

module.exports = (app) => {
    let passport = app.passport
        // Scope specifies the desired data fields from the user account
    let scope = 'email, user_posts, read_stream, user_likes, publish_actions'
    let twitterConfig = app.config.auth.twitter
    let fbConfig = app.config.auth.facebook

    FB.options({
        appId: fbConfig.consumerKey,
        appSecret: fbConfig.consumerSecret,
        redirectUri: fbConfig.redirectUri
    })

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

    app.get('/timeline', isLoggedIn, then(async(req, res) => {
        try {
            console.log(">< in timeline")
            // console.log("req.user.twitter", req.user.twitter)
            // console.log("twitterConfig", twitterConfig)
            // let twitterClient = new Twitter({
            //     consumer_key: twitterConfig.consumerKey,
            //     consumer_secret: twitterConfig.consumerSecret,
            //     access_token_key: req.user.twitter.token,
            //     access_token_secret: req.user.twitter.secret
            // })
            // let [tweets, ] = await twitterClient.promise.get('/statuses/home_timeline')
            // tweets = tweets.map(tweet => {
            //     return {
            //         id: tweet.id_str,
            //         image: tweet.user.profile_image_url,
            //         text: tweet.text,
            //         name: tweet.user.name,
            //         username: "@" + tweet.user.screen_name,
            //         liked: tweet.favorited,
            //         network: networks.twitter
            //     }
            // })

            let fbPosts
            try {
                let fbPosts = await FB.api.promise('/me/home', {
                        // fields: 'id, story,picture',
                        limit: 10,
                        access_token: req.user.facebook.token
                    })
                    // console.log("><fbPosts", fbPosts)
            } catch (e) {
                fbPosts = e.data
                console.log("E", e)
            }
            console.log(">< from", fbPosts[0].from)

            let fbPostsProcessed = []
            for (let post of fbPosts) {
                let userId = post.from.id
                let picUri = '/' + userId + '/picture'
                let userPicture
                try {
                    userPicture = await FB.api.promise(picUri, {
                        redirect: false
                    })
                } catch (e) {
                    //TODO: so weird. plz fix
                    userPicture = e.data
                }
                //list of likes is coming from the api.
                let likes = post.likes ? post.likes.data : []

                console.log(">< likes", likes)
                console.log("req.user.id", req.user.facebook.id)

                fbPostsProcessed.push({
                    id: post.id,
                    image: userPicture.url, //post.picture,
                    text: post.story || post.message,
                    name: post.from.name,
                    pic: post.picture,
                    // username: "@" + tweet.user.screen_name,
                    liked: _.findIndex(likes, {
                        'id': req.user.facebook.id
                    }) >= 0, //find if likes array contains this user. 
                    network: networks.facebook

                })
            }

            let aggregatedPosts = _.union(fbPostsProcessed)
            res.render('timeline.ejs', {
                posts: aggregatedPosts
            })
        } catch (e) {
            console.log(e)
        }
    }))

    app.get('/compose', isLoggedIn, (req, res) => {
        res.render('compose.ejs')
    })

    app.post('/compose', isLoggedIn, then(async(req, res) => {
        let text = req.body.reply
        if (text.length > 140) {
            return req.flash('error', 'status is over 140 chars')
        }
        if (!text.length) {
            return req.flash('error', 'status is empty')
        }
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })

        await twitterClient.promise.post('statuses/update', {
            status: text
        })
        return res.redirect('/timeline')
    }))

    app.post('/twitter/like/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })
        let id = req.params.id

        await twitterClient.promise.post('favorites/create', {
            id
        })

        res.end()
    }))



    app.post('/facebook/like/:id', isLoggedIn, then(async(req, res) => {
        let id = req.params.id
        let uri = `/${id}/likes`
        try {
            await FB.api.promise(uri, 'post', {
                access_token: req.user.facebook.token
            })
        } catch (e) {
            console.log("e", e)
        }
        res.end()
    }))
    app.post('/facebook/unlike/:id', isLoggedIn, then(async(req, res) => {
        let id = req.params.id
        let uri = `/${id}/likes`
        try {
            await FB.api.promise(uri, 'delete', {
                access_token: req.user.facebook.token
            })
        } catch (e) {
            console.log("e", e)
        }
        res.end()
    }))


    app.post('/twitter/unlike/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })
        let id = req.params.id

        await twitterClient.promise.post('favorites/destroy', {
            id
        })

        res.end()
    }))

    app.get('/reply/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })
        let id = req.params.id
        let [tweet, ] = await twitterClient.promise.get('/statuses/show/' + id)

        tweet = {
            id: tweet.id_str,
            image: tweet.user.profile_image_url,
            text: tweet.text,
            name: tweet.user.name,
            username: "@" + tweet.user.screen_name,
            liked: tweet.favorited,
            network: networks.twitter
        }

        res.render('reply.ejs', {
            post: tweet
        })
    }))

    app.post('/reply/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })
        let id = req.params.id
        let text = req.body.reply
        if (text.length > 140) {
            return req.flash('error', 'status is over 140 chars')
        }
        if (!text.length) {
            return req.flash('error', 'status is empty')
        }

        await twitterClient.promise.post('statuses/update', {
            status: "@LinghuaJ " + text,
            in_reply_to_status_id: id
        })
        return res.end()
    }))


    app.get('/share/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })
        let id = req.params.id
        let [tweet, ] = await twitterClient.promise.get('/statuses/show/' + id)

        tweet = {
            id: tweet.id_str,
            image: tweet.user.profile_image_url,
            text: tweet.text,
            name: tweet.user.name,
            username: "@" + tweet.user.screen_name,
            liked: tweet.favorited,
            network: networks.twitter
        }

        res.render('share.ejs', {
            post: tweet
        })
    }))
    app.post('/share/:id', isLoggedIn, then(async(req, res) => {
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.secret
        })
        let id = req.params.id
        console.log("><req.body", req.body)
        let text = req.body.share
        if (text.length > 140) {
            return req.flash('error', 'status is over 140 chars')
        }
        if (!text.length) {
            return req.flash('error', 'status is empty')
        }
        try {

            await twitterClient.promise.post('statuses/retweet/' + id, {
                text
            })
        } catch (e) {
            console.log("><E", e)
        }
        return res.end()
    }))

    app.get('/auth/twitter', passport.authenticate('twitter'))

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }))

    // Authorization route & Callback URL
    app.get('/connect/twitter', passport.authorize('twitter'))
    app.get('/connect/facebook/twitter', passport.authorize('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }))

    //TODO: complete facebook login
    // Authentication route & Callback URL
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope
    }))
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/login',
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