const MessageTracker = require('../services/libraries/slack/MessageTracker');
const discord = require('../classes/HBClient');

function handleGetMessages() {
	return;
	if (process.env.NODE_ENV == 'development')
		return console.log('Slack ↪ Disabled in development mode');

	new MessageTracker('C0690FHNFAQ', 5000, '1107732597011906630');
	new MessageTracker('C043WKM211T', 10000, '976357520895528965');

	// Cohort Spe 20
	new MessageTracker('C068HL6SKF0', 60000, '1187047888585498681');

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
