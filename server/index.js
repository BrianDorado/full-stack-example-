 require('dotenv').config()
 const express = require('express')
 , bodyParser = require('body-parser')
 , cors = require('cors')
 , session = require('express-session')
 , passport = require('passport')
 , Auth0Strategy = require('passport-auth0')
 , massive = require('massive')

 const app = express()

 app.use(cors())
 app.use(bodyParser.json())

 massive(process.env.DB_CONNECTION).then( db => {
     app.set( 'db', db)
 })
 app.use(session({
     secret: process.env.SESSION_SECRET,
     saveUnintialized: true,
     resave: false
 }))
 app.use(express.static(_dirname + '/../build'))

 app.use(passport.initialize())
 app.use(passport.session())

 passport.use( new Auth0Strategy({
     domain: process.env.AUTH_DOMAIN,
     clientID:process.env.AUTH_CLIENT_ID,
     clientSecret:process.env.AUTH_CLIENT_SECRET,
     callbackURL:process.env.AUTH_CALLBACK,
 },function(accessToken, refreshToken, extraParams, profile,done){
     const db = app.get('db')
    //  console.log(profile)
     let userData = profile._json
        // console.log(userData)
     let  auth_id = userData.sub.split('|')[1]
    
     db.find_User([auth_id]).then( user => {
         if( user[0] ){
             return done(null, user[0].id)
         } else {
             db.create_User([userData.name, userData.email, userData.picutre, auth_id])
             .then( user => {
                return done(null, user[0].id)
            })
         }
     })
 }))

 app.get('/auth',passport.authenticate('auth0'))
 app.get('/auth/callback',passport.authenticate('auth0',{
     successRedirect: process.env.AUTH_PRIVATE_REDIRECT,
     failureRedirect: process.env.AUTH_LANDING_REDIRECT
 }))

 passport.serializeUser(function(user,done){
     done(null, user)
 })

 passport.deserializeUser(function(user, done){
     const db = app.get('db')
     db.find_User_by_session([user]).then(user => {
         done(null, user[0])
     })
    })
     // make query call to find user
    // save only ID to keep information (email, userImage) up to date
 

 app.get('/auth/me', function(req, res, next){
     if (!req.user){
         res.status(401).send('Login Required')
     } else { 
         res.status(200).send(req.user)
     }
 })

 app.get('/auth/logout', function(req, res, next){
     req.logout()
     res.redirect(process.env.AUTH_LANDING_REDIRECT)
 })

 app.listen(process.env.SERVER_PORT, () => {console.log(`listening on port: 3005`)})