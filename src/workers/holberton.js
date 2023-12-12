const { GuildMember, Role, Collection, ActivityType } = require('discord.js');
const { _removeRole } = require('../services/functions/discordRolesUtils');
const EventService = require('../services/EventService');
const ApiController = require('../services/Holberton');
const User = require('../services/classes/User');
const discord = require('../classes/HBClient');

/**
 * Remove user from userIds
 * @param {string[]} userIds
 * @param {string} id
 */
function whitelistUser(userIds, id) {
	const index = userIds.indexOf(id);
	if (index > -1) {
		userIds.splice(index, 1);
	};
};

/**
 * Create a new User instance and add it to the users object or refresh data
 * @param {object} user
 * @param {GuildMember} member
 */
function rebuildUser(user, member) {
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
};

/**
 *
 * @param {object[]} usersEligibility
 * @param {Collection<string, GuildMember>} members
 * @param {string[]} userIds
 */
async function refreshEligibleUsers(usersEligibility, members, userIds) {
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
		whitelistUser(userIds, member.user.id);
		rebuildUser(user, member);
	};
};

/**
 * Check if member is an admin
 * @param {GuildMember} member
 * @returns {boolean}
 */
function isAdmin(member) {
	return member.user.bot || member.roles.cache.has('1165695741939945564') || member.roles.cache.has('1107994742018560060');
};

/**
 * Check if role is already synced
 * @param {Role} role
 * @returns {boolean}
 */
function isSynced(role) {
	const roles = discord.cache.getRoles();
	const cohort = roles.get("cohorts").has(role.id);
	const student = roles.get("ActiveStudent");
	const specialization = roles.get("specialization");
	return (cohort || role.id === student.id || role.id === specialization.id) ? false : true;
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
			whitelistUser(userIds, id);
			continue;
		};

		try {
			u.roles.cache.map((role) => {
				if (role.name === "@everyone") return;
				if (isSynced(role)) return;
				_removeRole(u, role);
			});
		} catch(e) {
			console.log(e.message);
		};
	};
};

/**
 * Create a fake user for testing purposes
 * @param {object[]} users
 * @returns {void}
 */
function createFakeUser(users, tag) {
	users.push({
		"id": `${tag.toLowerCase()}_id`,
		"slack_id": `${tag.toLowerCase()}_slack_id`,
		"discord_tag": tag,
		"username": `TestUser_${tag.toLowerCase()}`,
		"cohort": {
			"id": Math.random().toString(36).substring(7),
			"name": "C22-202208",
			"number": "22",
		},
		"products": [
			{
				"status": "In progress",
				"title": "Full Stack Software Engineer",
			}
		],
		"cache": {
			"fundamental_cohort": "C#2000",
		},
		"active": false
	});
	console.log('Holberton ↪', `Added fake user ${tag}`);
};

async function handleLoadUsers() {
	console.log('Holberton ↪', 'Loading users...');
	discord.user.setActivity('Initializing...', { type: ActivityType.Custom });
	/** @type {object[]} */
	const users = process.env.NODE_ENV === 'development' ? [] : await ApiController('users', {campus: 'TLS'});
	const members = discord.cache.getMembers();

	if (users.status === false) {
		console.log('Holberton ↪', 'Error while loading users');
		discord.user.setActivity('Some errors detected', { type: ActivityType.Custom });
		return;
	};

	/* TODO: Remove this before merging to production. */
	if (process.env.NODE_ENV === 'development')
		for (const member of members.values())
			createFakeUser(users, member.user.tag);


	/** @type {object[]} */
	const usersEligibility = users.filter(user => user.discord_tag);

	/* TODO: Remove unused variable activeCount if not needed */
	let activeCount = 0;
	const userIds = members.map(member => member.user.id);

	console.log('Holberton ↪', `${usersEligibility.length} user(s) received`);

	refreshEligibleUsers(usersEligibility, members, userIds);
	removeNonEligibleUsers(userIds, members);

	discord.user.setActivity(`${usersEligibility.length - userIds.length} students`, { type: ActivityType.Custom});
	console.log('Holberton ↪', `${userIds.length} user(s) not validated`);
	setTimeout(() => EventService.emit('discord.refresh'), 60000);
};

EventService.on('holberton.load', handleLoadUsers);