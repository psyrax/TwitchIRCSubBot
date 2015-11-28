var moment = require('moment');
var _ = require('underscore');
var node_env = process.env.NODE_ENV || 'development';

function getRanks(rankTime, special){
	if ( special == 'psyrax' ){
		return 'probe';
	};
	switch(rankTime){
		case 0:
		case 1:
			return 'larva';
		break;
		case 2:
			return 'zergling';
		break;
		case 3:
			return 'baneling';
		break;
		case 4:
			return 'roach';
		break;
		case 5:
			return 'hydralisk';
		break;
		case 6:
			return 'mutalisk';
		break;
		case 7:
			return 'lurker';
		break;
		case 8:
			return 'brood-lord';
		break;
		case 9:
			return 'ultralisk';
		break;
		case 10:
			return 'leviathan';
		break;
		case 11:
			return 'overmind';
		break;
		default:
			return 'kerrigan';
		break;
	};
}

var userDisplay = {
	set: function(user){
		return user;
	},
	get: function(subs, who){
		var userToDisplay;
		_.each(subs, function(sub){
			if ( sub.user.name == who ){
				var monthDate = sub.created_at.split('T');
				userToDisplay = sub.user;
				userToDisplay.timeSince = moment(monthDate[0]).fromNow();
				var today = moment();
				var subsDate = moment(monthDate[0])
				userToDisplay.rankTime = today.diff(subsDate, 'months');
				userToDisplay.rank = getRanks(userToDisplay.rankTime, who);
				userToDisplay.setOn = today;
			};
		});

		if ( userToDisplay ){
			return this.set(userToDisplay);
		};
	}
}
module.exports = userDisplay;