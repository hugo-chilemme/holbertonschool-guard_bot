const { GuildMember, Role, Collection, ActivityType } = require('discord.js');
const { _removeRole } = require('../services/functions/discordRolesUtils');
const EventService = require('../services/EventService');
const ApiController = require('../services/Holberton');
const User = require('../services/classes/User');
const fakeUser = require('../modules/fakeUser');
const discord = require('../classes/HBClient');

/* Staff roles */
const admin_roles = [
	'1165695741939945564',
	'1107994742018560060',
	'1158687105095045180'
];

/**
 * Create a new User instance and add it to the users object or refresh data
 * @param {object} user
 * @param {GuildMember} member
 */
function refreshUserInstance(user, member) {
	try {
		const cache = discord.cache.getUsers();
		let current = cache.get(user.id);
		if (!cache.has(user.id))
		{
			const instUser = new User(user, member);
			cache.set(user.id, instUser);
			cache.set(member.user.id, instUser);
			cache.set(user.slack_id, instUser);
			current = instUser;
		};
		/* TODO: Maybe rename variable 'user' to something more meaningful */
		current.user = user; //refresh data
	} catch (error) {
		console.error(`Holberton ↪ refreshUserInstance() -> ${error.message}`);
	};
};

/**
 * Is this needed ?
 * Refresh user data
 * @param {object} user
 * @returns {object}
 */
async function requestUserSync(user) {
	return await ApiController('users/' + user.id, {refresh: true});
};

/**
 * Get whitelisted roles
 * @returns {string[]}
 */
function getWhitelistedRoles() {
	try {
		const cache = [];
		const roles = discord.cache.getRoles();
		const cohort = roles.get("cohorts");
		const ActiveStudent = roles.get("ActiveStudent");
		const specialization = roles.get("specialization");
		cache.push(cohort.map(role => role.id));
		cache.push(ActiveStudent.id);
		cache.push(specialization.id);
		return cache;
	} catch (error) {
		console.error(`Holberton ↪ getWhitelistedRoles() -> ${error.message}`);
	};
	return null;
}

/**
 * Remove user whitelisted roles
 * @param {GuildMember} member
 * @returns {void}
 */
function removeFromWhitelist(member) {
	const whitelisted = getWhitelistedRoles();
	const roles = member.roles.cache;
	roles.forEach(role => {
		if (whitelisted.includes(role.id))
			_removeRole(member, role);
	});
};


/**
 * Get user privileges
 * @param {GuildMember} member
 * @returns {boolean}
 */
function hasPrivileges(member) {
	try {
		if (member.user.bot) return true;
		const roles = member.roles.cache.values();
		for (const role of roles) {
			if (role instanceof Role) {
				if (admin_roles.includes(role.id))
					return true;
			};
		}
	} catch (error) {
		console.error(`Holberton ↪ hasPrivileges() -> ${error.message}`);
	};
	return false;
};

/**
 * Store users by discord tag
 * @param {object} users
 * @returns {object}
 */
function prepareUsers(users) {
	const data = {};
	for (let user of users) {
		if (!user)
			continue;
		const discord_tag = user.discord_tag.split('#')[0].toLowerCase();
		data[discord_tag] = user;
	};
	return data;
};

/**
 * Sync API users with system
 * @param {Collection<string, GuildMember>} members
 * @param {object} apiUsers
 * @returns {number}
 */
function refreshUsers(members, apiUsers) {
	const users = prepareUsers(apiUsers);
	let active = 0;
	try {
		members.forEach(member => {
			/* Check if user is in the whitelist */
			const tag = member.user.username.toLowerCase();
			let user = users[tag];
			if (hasPrivileges(member))
			{
				console.log('Holberton ↪', `${member.user.tag} is ${member.user.bot ? 'bot' : 'admin'}`);
				active++;
				return;
			};
			if (!user) {
				user = requestUserSync(member.user);
				if (!user)
				{
					removeFromWhitelist(member);
					return;
				};
			};
			refreshUserInstance(user, member);
			active++;
		});
	} catch (error) {
		console.error(`Holberton ↪ refreshUsers() -> ${error.message}`);
	};
	return active;
};

async function handleLoadUsers() {
	console.log('Holberton ↪', 'Loading users...');
	discord.user.setActivity('Initializing...', { type: ActivityType.Custom });
	try {
		/** @type {object[]} */
		const users = process.env.NODE_ENV === 'development' ? [] : await ApiController('users', {campus: 'TLS'});
		const members = discord.cache.getMembers();

		/* Create fake users for development */
		if (process.env.NODE_ENV === 'development')
			members.forEach(member => {
				if (member.user.bot) return;
				users.push(fakeUser.create(member.user.tag, Number(member.user.id), false));
			});

		/* Store users with valid discord tag */
		const usersLinked = users.filter(user => user.discord_tag);
		console.log('Holberton ↪', `${usersLinked.length} user(s) received`);
		const activeCount = refreshUsers(members, usersLinked);

		discord.user.setActivity(`${activeCount} students`, { type: ActivityType.Custom});
		console.log('Holberton ↪', `${members.size - activeCount} user(s) not validated`);
	} catch (error) {
		console.error(`Holberton ↪ handleLoadUsers() -> ${error.message}`);
		discord.user.setActivity('Some errors detected', { type: ActivityType.Custom });
	};
	setTimeout(() => EventService.emit('discord.refresh'), 60000);
};

EventService.on('holberton.load', handleLoadUsers);