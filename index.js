var node_env = process.env.NODE_ENV || 'development';
var _ = require('underscore');
var configFile = require( __dirname  + '/config.json');
var makeConfig = function(){
	return configFile[node_env];
};
var config = makeConfig();

var moment = require('moment');
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
var request = require('superagent');

var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({secret:"E3A869964F2D7135393A92DC77A62A12B39579B083736A1338F136E790401069"}));
app.use(passport.initialize());
app.use(express.static("./public"));

var irc = require("irc");

var subs = [];
var users = [];
var nowDisplaying = [];

var bot = new irc.Client(config.irc.server, config.irc.username, {
    debug: true,
    channels: config.irc.channels,
    password: config.irc.password
});

bot.addListener('registered', function() {
    bot.send('CAP', 'REQ', 'twitch.tv/membership');
});

bot.addListener('error', function(message) {
    console.log('error: ', message);
});

bot.addListener("join", function(channel, who) {
	if ( who != config.username && users.indexOf(who) < 0){
		users.push(who);
		console.log('connected:', who);
		getToDisplay(who, 'jimrsng');
	}
});

bot.addListener("part", function(channel, who) {

	var indexuser = users.indexOf(who);
	if ( who != config.username && indexuser >= 0){
		users.splice(indexuser, 1);
	}
});

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

app.get('/auth/twitch', passport.authenticate('twitch'));

app.get('/oauth', passport.authenticate('twitch', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/control');
});

app.get('/control',isAuthenticated, function(req, res){

	var userInfo = req.session.passport.user._json;
	console.log('user: ', userInfo.display_name);
	console.log('token: ',req.session.passport.user.token);
	res.render('control', {user_info: userInfo, useScripts: true});	
});

function getSubs(user, token, callback){
	var getUser = ( node_env  == 'development') ? 'jimrsng': user;
	var getToken = ( node_env  == 'development') ? 'gxxlcqzwplv20m9gocusjorsjhe5ap' : token;
	var urlRequest = 'https://api.twitch.tv/kraken/channels/'+ getUser +'/subscriptions?limit=100';
	console.log(urlRequest);
	request
		.get(urlRequest)
		.set('Authorization', 'OAuth '+ getToken)
		.set('Accept', 'application/vnd.getToken.v3+json')
		.end(function(err, res){
			if (  res.body.subscriptions && res.body.subscriptions.length > 0 ){
				subs.push(getUser);
				subs[getUser] = res.body.subscriptions;
				callback(res.body.subscriptions);
			} else {
				callback(res.body.message, true);
			};
		});
};

function getToDisplay(who, user){
	var user = ( node_env  == 'development') ? 'jimrsng': user;
	var userToDisplay;
	_.each(subs[user], function(sub){
		console.log(sub.user.name);
		if ( sub.user.name == who ){
			var monthDate = sub.created_at.split('T');
			userToDisplay = sub.user;
			userToDisplay.timeSince = moment(monthDate[0]).fromNow();
		};
	});
	console.log('To search :', who);
	console.log('To display :', userToDisplay);

	if ( userToDisplay ){
		nowDisplaying[user] = userToDisplay;
	};
}

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/ajax/subs', isAuthenticated, function(req, res){
	var currentUser = req.session.passport.user._json.name;
	console.log(currentUser);
	if ( subs[currentUser] ){
		res.json( subs[currentUser] );
	} else {
		getSubs(currentUser, req.session.passport.user.token, function(data, err){
			if (err) console.log(data);
			if (err){
				res.status(500).json(data);
			} else {
				res.json(data);
			};
		});
	};
});

app.get('/display', isAuthenticated, function(req, res){
	var getUser = ( node_env  == 'development') ? 'jimrsng': req.session.passport.user._json.name;
	res.json(nowDisplaying[getUser]);
});

app.get('/:user', function(req, res){
	res.send('Hola '+ req.params.user + ' no olvides visitar http://fritanga.tv for the lolz!');
})

app.listen(3000, function(){
	console.log('App running');
});
