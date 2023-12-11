const EventService = require('../services/EventService');
const discord = require('../classes/HBClient');
const { Events, Guild, Collection } = require('discord.js');
const config = require('../config');

/**
 * Load and store members from guild
 * @param {Guild} guild
 * @returns {Promise<Collection<string, GuildMember>>}
 */
async function loadMembers(guild) {
	discord.cache.set('members', await guild.members.fetch());
	return discord.cache.getMembers();
};

/**
 * Load and store roles from guild
 * @param {Guild} guild
 */
async function loadRoles(guild) {
	const roles = await guild.roles.fetch();
	const cache = new Collection();
	cache.set('cohorts', roles.filter(role => role.name.match(/^C#\d+$/)));
	cache.set('specialization', roles.find(role => role.id === config.ROLE_SPECIALIZATION));
	cache.set('ActiveStudent', roles.find(role => role.id === config.ROLE_ACTIVE_STUDENT));
	discord.cache.set('roles', cache);
	return discord.cache.getRoles();
};

/**
 * Refresh cache
 */
async function refreshCache() {
	const guild = discord.guilds.cache.get(config.GUILD_ID);
	if (!guild) {
		console.log('Discord ↪\tConfigured GUILD_ID is invalid.');
		process.exit(1);
	};

	discord.cache.set('guild', guild);
	discord.cache.set("users", new Collection());
	const members = await loadMembers(guild);
	const roles = await loadRoles(guild);

	console.log('Discord ↪', `Loaded ${members.size} members and ${roles.size} roles.`);

	EventService.emit('holberton.load');
};

discord.on(Events.ClientReady, refreshCache);
EventService.on('discord.refresh', refreshCache);