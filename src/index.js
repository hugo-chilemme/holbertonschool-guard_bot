const { Client, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN } = require('./config');
const fs = require('fs');
const path = require('path');

const system = require('./system');
global.SystemService = new system();

global.discord = new Client({ intents: Object.values(GatewayIntentBits).filter(value => typeof value !== 'number'), partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
global.members = {};
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

discord.login(DISCORD_TOKEN);
