var node_env = process.env.NODE_ENV || 'development';
var _ = require('underscore');
var configFile = require( __dirname  + '/config.json');
var makeConfig = function(){
	return configFile[node_env];
};
var config = makeConfig();


var express = require('express');
var bodyParser     = require("body-parser");
var cookieParser   = require("cookie-parser");
var cookieSession  = require("cookie-session");
var passport       = require("passport");
var twitchStrategy = require("passport-twitch").Strategy;
var exphbs  = require('express-handlebars');
var hbs = exphbs.create({
	defaultLayout: 'main'
});


var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({secret:"E3A869964F2D7135393A92DC77A62A12B39579B083736A1338F136E790401069"}));
app.use(passport.initialize());
app.use(express.static("./public"));

var displayUser = require('./displayUser');
var getUsers = require('./getUsers');
var subs = [];
var users = [];
var nowDisplaying = [];


function isAuthenticated(req, res, next) {
    if (req.session.passport && req.session.passport.user)
        return next();
    res.redirect('/');
};

passport.use(new twitchStrategy({
    clientID: config.twitchClient,
    clientSecret: config.twitchSecret,
    callbackURL: config.twitchRedirect,
    scope: ["user_read", "channel_subscriptions", "channel_check_subscription"]
  },
  function(accessToken, refreshToken, profile, done) {

  	profile.token = accessToken;
  	profile.refresh = refreshToken;
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
})

app.get('/', function (req, res) {
	res.render('home');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/auth/twitch', passport.authenticate('twitch'));

app.get('/oauth', passport.authenticate('twitch', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/control');
});

app.get('/control',isAuthenticated, function(req, res){
	var userInfo = req.session.passport.user._json;
	res.render('control', {user_info: userInfo, useScripts: true});	
});

app.get('/display', isAuthenticated, function(req, res){
	var getUser = ( node_env  == 'development') ? 'jimrsng': req.session.passport.user._json.name;
	var is_ajax_request = req.xhr;
	if ( is_ajax_request ){
		res.json(nowDisplaying[getUser]);
	} else {
		res.render('display', {user: nowDisplaying[getUser], isDisplay: true});
	};
});

app.get('/ajax/subs', isAuthenticated, function(req, res){
	var currentUser = req.session.passport.user._json.name;
	if ( subs[currentUser] ){
		res.json( subs[currentUser] );
	} else {
		var getChannel = ( node_env  == 'development') ? 'jimrsng': currentUser;
		var getToken = ( node_env  == 'development') ? 'gxxlcqzwplv20m9gocusjorsjhe5ap' : req.session.passport.user.token;
		getUsers.subs(getChannel, getToken, function(data, err){
			if (err) console.log(data);
			if (err){
				res.status(500).json(data);
			} else {
				subs[getChannel] = data;
				var topUser = data[1].user.name;
				nowDisplaying[getChannel] = displayUser.get(subs[getChannel], topUser);
				res.json(data);
			};
		});
	};
});

app.get('/ajax/chatters', isAuthenticated, function(req, res){
	var currentUser = req.session.passport.user._json.name;
	var getChannel = ( node_env  == 'development') ? 'jimrsng': currentUser;
	getUsers.chatters(getChannel, function(data){
		res.json(data);
	});
});
app.post('/ajax/display/set', isAuthenticated, function(req, res){
	var getChannel = ( node_env  == 'development') ? 'jimrsng': currentUser;
	nowDisplaying[getChannel] = displayUser.get(subs[getChannel], req.body.userToDisplay);
	res.json(nowDisplaying[getChannel]);
});

app.listen(3000, function(){
	console.log('App running');
});

