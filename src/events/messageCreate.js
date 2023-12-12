const { Message, ChannelType, User } = require('discord.js');
const APIController = require('../services/Holberton');
const discord = require('../classes/HBClient');
const rankCard = require('../../modules/rankCard');

/**
 * Add
 * @param {object} data
 * @param {Message} message
 * @param {number} multiplier
 */
async function addXp(user, data, message, multiplier = 1.2) {
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

	if (process.env.NODE_ENV === 'production') {
		await APIController('users/' + user.user.id + '/set', {
			xp: data.xp,
			total_xp: data.total_xp,
			total_messages: data.total_messages,
			average_message_length: data.average_message_length,
			level: data.level,
			next_level_xp: data.next_level_xp
		});
	};

	return {"data": data, "level_up": level_up};
}

/**
 * Send DM to user when level up
 * @param {User} member
 * @param {object} experience
 * @returns {Promise<void>}
 */
async function onLevelUp(member, experience, type = "holbie") {
	try {
		const dm = await member.createDM();
		await dm.send({content:`Tu est maintenant un ***${type}*** de niveau *${experience.level}* ! ✨`});
	} catch (e) {
		console.error(`Discord ↪ Error while sending DM (XP Reward) to (${member.tag}, ${member.id})`);
		console.error(e.message);
	};
}

/**
 * Listen for message events
 * @param {HBClient} client
 * @param {Message} message
 * @returns
 */
module.exports = async (client, message) => {
	const member = message.author;
	if (!member) return;
	if (member.bot) return;

	const users = discord.cache.getUsers();
	const user = users.get(member.id);
	if (!user) return;

	if (message.channel.type === ChannelType.DM) return;
	if (message.channel.name.includes('ticket-')) return;

	const isHelpChannel = message.channel.name.includes('aides');

	if (isHelpChannel) {
		const {data, level_up} = await addXp(user, user.help_experience, message, 1.5);
		user.help_experience = data;
		if (level_up) onLevelUp(member, data, "helper");
	} else {
		const {data, level_up} = await addXp(user, user.message_experience, message);
		user.message_experience = data;
		if (level_up) onLevelUp(member, data);
	};

};