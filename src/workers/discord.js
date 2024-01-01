const EventService = require('../services/EventService');
const discord = require('../classes/HBClient');
const { Events, Guild, Collection } = require('discord.js');

/**
 * Load and store members from guild
 * @param {Guild} guild
 * @returns {Promise<Collection<string, GuildMember>>}
 */
async function loadMembers(guild) {
	try {
		const members = await guild.members.fetch();
		discord.cache.set('members', members);
		return members;
	} catch (error) {
		console.log(`Discord ↪ Failed to load members. ${error.message}`);
	};
	return discord.cache.getMembers();
};

/**
 * Load and store roles from guild
 * @param {Guild} guild
 */
async function loadRoles(guild) {
	try {
		const roles = await guild.roles.fetch();
		const cache = new Collection();
		cache.set('cohorts', roles.filter(role => role.name.match(/^C#\d+$/)));
		cache.set('specialization', roles.find(role => role.id === process.env.ROLE_SPECIALIZATION));
		cache.set('ActiveStudent', roles.find(role => role.id === process.env.ROLE_ACTIVE_STUDENT));
		discord.cache.set('roles', cache);
		return cache;
	} catch (error) {
		console.log(`Discord ↪ Failed to load roles. ${error.message}`);
	};
	return discord.cache.getRoles();
};

/**
 * Refresh cache
 */
async function refreshCache() {
	const guild = discord.guilds.cache.get(process.env.GUILD_ID);
	if (!guild) {
		console.log('Discord ↪\tConfigured GUILD_ID is invalid.');
		process.exit(1);
	};

	discord.cache.set('guild', guild);
	const members = await loadMembers(guild);
	const roles = await loadRoles(guild);
	console.log('Discord ↪', `Loaded ${members.size} members and ${roles.size} roles.`);

	EventService.emit('holberton.load');
};

discord.on(Events.ClientReady, refreshCache);
EventService.on('discord.refresh', refreshCache);