const MessageTracker = require('../services/libraries/slack/MessageTracker');
const discord = require('../classes/HBClient');

function handleGetMessages() {
	if (process.env.NODE_ENV == 'development')
		return console.log('Slack ↪ Disabled in development mode');

	new MessageTracker('C0690FHNFAQ', 5000, '1107732597011906630');
	new MessageTracker('C043WKM211T', 10000, '976357520895528965');

	// Cohort 20
	new MessageTracker('C0482KTMLUE', 60000, '1072080158837706792');

	// Cohort 21
	new MessageTracker('C04B9DJM265', 60000, '1108093224888832050');

	// Cohort 22
	new MessageTracker('C04PKDQNDQA', 60000, '1143262201889689713');

};

discord.on('ready', () => {
	setTimeout(() => {
		handleGetMessages()
	}, 2000)
});
