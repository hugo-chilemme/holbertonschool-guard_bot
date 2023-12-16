const { Message, ChannelType } = require('discord.js');
const discord = require('../classes/HBClient');
const handleXP = require('../modules/xp');

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
	await handleXP(user, message, member);
};