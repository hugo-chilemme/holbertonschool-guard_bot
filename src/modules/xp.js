const { Message, User, GuildMember } = require('discord.js');
const ApiController = require('../services/Holberton');

/**
 * Add
 * @param {object} data
 * @param {Message} message
 * @param {number} multiplier
 * @param {string} type
 */
async function addXp(user, data, message, multiplier = 1.2, type = "message_experience") {
	const xp_random = Math.floor(Math.random() * 10 + 20);

	data.xp += xp_random;
	data.total_xp += xp_random;
	data.total_messages++;
	data.average_message_length = Math.round((data.average_message_length + message.content.length) / data.total_messages);

	const level_up = data.xp >= data.next_level_xp;

	if (level_up)
	{
		data.xp = 0;
		data.level++;
		data.next_level_xp = Math.floor((data.next_level_xp * multiplier) - data.xp);
		console.log("Level up! " + user.user.username + " is now level " + data.level + "!");
	};

	/* Don't update API if in development mode */
	if (process.env.NODE_ENV !== 'development') {
		await ApiController('users/' + user.user.id + '/set', {
			[type]: {
				xp: data.xp,
				total_xp: data.total_xp,
				total_messages: data.total_messages,
				average_message_length: data.average_message_length,
				level: data.level,
				next_level_xp: data.next_level_xp
			}
		});
	};
	return {"data": data, "level_up": level_up};
};

/**
 * Send DM to user when level up
 * @param {User} member
 * @param {Message} message
 * @param {object} experience
 * @returns {Promise<void>}
 */
async function onLevelUp(member, message, experience, type = "holbie") {
	try {
		message.reply({content:`Tu es maintenant ***${type}*** de niveau *${experience.level}* ! ✨`});
	} catch (e) {
		console.error(`Discord ↪ Error while replying to message onLevelUp() to (${member.tag}, ${member.id})`);
		console.error(e.message);
	};
};

/**
 * Handle XP
 * @param {object} user
 * @param {Message} message
 * @param {GuildMember} member
 */
module.exports = async (user, message, member) => {
	if (message.channel.name.includes('ticket-')) return;

	const isHelpChannel = message.channel.name.includes('aides');

	if (isHelpChannel) {
		const {data, level_up} = await addXp(user, user.help_experience, message, 1.5, "help_experience");
		user.help_experience = data;
		if (level_up) onLevelUp(member, message, user.help_experience, "helper");
	} else {
		const {data, level_up} = await addXp(user, user.message_experience, message, 1.2, "message_experience");
		user.message_experience = data;
		if (level_up) onLevelUp(member, message, user.message_experience);
	};
};