let express = require('express')
    , passport = require('passport')
    , util = require('util')
    , session = require('express-session')
    , OpenIDStrategy = require('../lib/index').Strategy;
let bodyParser = require('body-parser')

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (identifier, done) {
    done(null, { identifier: identifier });
});

passport.use(new OpenIDStrategy({
    clientId: 'xxx',
    clientSecret: 'xxx',
    refCode: 'xxx',
}));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// app.use(express.methodOverride());
app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,
    resave: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

// POST /auth/openid
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in OpenID authentication will involve redirecting
//   the user to their OpenID provider.  After authenticating, the OpenID
//   provider will redirect the user back to this application at
//   /auth/openid/return
app.post('/auth/oneid',
    passport.authenticate('oneid', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

// GET /auth/oneid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/oneid/return',
    passport.authenticate('oneid', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}