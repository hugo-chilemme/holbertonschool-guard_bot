const { _removeRole } = require('../services/functions/discordRolesUtils');
const EventService = require('../services/EventService');
const ApiController = require('../services/Holberton');
const { GuildMember, Role, Collection, ActivityType } = require('discord.js');
const User = require('../services/classes/User');
const discord = require('../classes/HBClient');

/**
 * Remove user from userIds
 * @param {string} id
 */
function whitelistUser(id) {
	const index = userIds.indexOf(id);
	if (index > -1) {
		userIds.splice(index, 1);
	};
};

/**
 *
 * @param {object[]} usersEligibility
 * @param {object[]} users
 * @param {Collection<string, GuildMember>} members
 */
async function refreshEligibleUsers(usersEligibility, users, members) {
	for (let user of usersEligibility) {
		let member = members.find(u =>
			u.user.username.toLowerCase() === user.discord_tag.split('#')[0].toLowerCase()
		);
		if (!member) {
			user = await ApiController('users/' + user.id, {refresh: true});
			member = members.find(u =>
				u.user.username.toLowerCase() === user.discord_tag.split('#')[0].toLowerCase()
			);
			if (!member) continue;
		}
		whitelistUser(member.user.id);
		createUser(user, member, users);
	};
};

/**
 * Create a new User instance and add it to the users object
 * @param {object} user
 * @param {object} apiStudent
 * @param {object[]} users
 */
function createUser(user, apiStudent, users) {
	if (!users[user.id])
	{
		const instUser = new User(user, apiStudent);

		users[user.id] = instUser;
		users[apiStudent.user.id] = instUser;
		users[user.slack_id] = instUser;
	};
	/* TODO: Maybe rename variable 'user' to something more meaningful */
	users[user.id].user = user; //refresh data
};

/**
 * Check if user is an admin
 * @param {GuildMember} user
 * @returns {boolean}
 */
function isAdmin(user) {
	return user.user.bot || user.roles.cache.has('1165695741939945564') || user.roles.cache.has('1107994742018560060');
};

/**
 * Check if role is already synced
 * @param {Role} role
 * @returns {boolean}
 */
function alreadySynced(role) {
	const roles = discord.cache.getRoles();
	return !roles.get("cohorts").has(role.id) && !roles.get("ActiveStudent").id !== role.id && !roles.get("specialization").id !== role.id;
};

/**
 * Remove roles from non Active Students
 * @param {Map} userIds
 * @param {Collection<string, GuildMember>} members
 */
function removeNonEligibleUsers(userIds, members) {
	for (const id of userIds)
	{
		const u = members.get(id);
		if (isAdmin(u)) {
			whitelistUser(id);
			continue;
		};
		try {
			u.roles.cache.map((role) => {
				if (role.name === "@everyone") return;
				if (alreadySynced(role)) return;
				_removeRole(u, role);
			});
		} catch(e) {
			console.log(e.message);
		};
	};
};

async function handleLoadUsers() {
	/** @type {object[]} */
	const users = await ApiController('users', {campus: 'TLS'});

	if (users.status === false) {
		console.log('Holberton ↪', 'Error while loading users');
		return;
	};

	/** @type {object[]} */
	const usersEligibility = users.filter(user => user.discord_tag);
	const members = discord.cache.getMembers();

	/* TODO: Remove unused variable activeCount if not needed */
	let activeCount = 0;
	let userIds = members.map(member => member.user.id);

	console.log('Holberton ↪', `${usersEligibility.length} users received`);

	refreshEligibleUsers(usersEligibility, userIds, users, members);
	removeNonEligibleUsers(userIds, members);

	discord.user.setActivity(`${usersEligibility.length - userIds.length} students`, { type: ActivityType.Custom});
	console.log('Holberton ↪', `${userIds.length} users not validated`);
	setTimeout(() => EventService.emit('discord.refresh'), 60000);
};

EventService.on('holberton.load', handleLoadUsers);