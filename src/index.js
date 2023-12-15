const fs = require('fs');
const path = require('path');

const { REST, Routes, Events } = require('discord.js');
const discord = require('./classes/HBClient');
// Load all files in the events/ directory

const eventsPath = path.join(__dirname, './events');
const workersPath = path.join(__dirname, './workers');
const commandsPath = path.join(__dirname, './commands');
const commands = [];

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

fs.readdirSync(commandsPath).forEach(file => {
	const target = commandsPath + '/' + file;

	try {
		const command = require(target);
		console.log('✓\t', target);
		commands.push(command.handler.toJSON());
		discord.commands.set(command.handler.name, command);
	} catch (e) {
		console.log('×\t', target);
		console.error(e);
	}
});

discord.on(Events.ClientReady, async () => {
	try {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        console.log("Discord ↪ Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationCommands(discord.user.id),
            {body: commands},
        );

        console.log("Discord ↪ Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    };
});
