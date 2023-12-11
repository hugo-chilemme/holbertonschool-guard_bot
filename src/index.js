const fs = require('fs');
const path = require('path');

const discord = require('./classes/HBClient');
global.users = {};
global.roles = {};
// Load all files in the events/ directory

const eventsPath = path.join(__dirname, './events');
const workersPath = path.join(__dirname, './workers');

fs.readdirSync(eventsPath).forEach(file => {
	const target = eventsPath + '/' + file;

	try {
		const eventHandler = require(target);
		console.log('✓\t', target);

		const eventName = file.split('.')[0];
		discord.on(eventName, eventHandler.bind(null, discord));
	} catch (e) {
		console.log('×\t', target);
		console.error(e);
	}
});

fs.readdirSync(workersPath).forEach(file => {
	const target = workersPath + '/' + file;

	try {
		require(target);
		console.log('✓\t', target);
	} catch (e) {
		console.log('×\t', target);
		console.error(e);
	}
});
