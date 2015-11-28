var node_env = process.env.NODE_ENV || 'development';
var request = require('superagent');


var getUsers = {
	subs: function(channel, token, callback){
		var urlRequest = 'https://api.twitch.tv/kraken/channels/'+ channel +'/subscriptions?limit=100';
		request
		.get(urlRequest)
		.set('Authorization', 'OAuth '+ token)
		.set('Accept', 'application/vnd.getToken.v3+json')
		.end(function(err, res){
			if (  res.body.subscriptions && res.body.subscriptions.length > 0 ){
				callback(res.body.subscriptions);
			} else {
				callback(res.body.message, true);
			};
		});
	}, 
	chatters: function(channel, callback){
		var urlRequest = 'http://tmi.twitch.tv/group/user/'+channel+'/chatters';
		request
		.get(urlRequest)
		.end(function(err, res){
			if (  res.body.chatters.viewers && res.body.chatters.viewers.length > 0 ){
				callback(res.body.chatters.viewers);
			} else {
				callback(res.body.message, true);
			};
		});
	}
}

module.exports = getUsers;