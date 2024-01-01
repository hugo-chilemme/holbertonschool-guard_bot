const { Message, ChannelType, AuditLogEvent } = require('discord.js');
const EmbedLog = require('../classes/EmbedLog');
const DataStore = require('../classes/DataStore');

/**
 * Listen for message remove events
 * @param {void} _
 * @param {Message} message
 */
module.exports = async (_, message) => {
	const member = message.author;
	if (!member) return;

	if (message.channel.type === ChannelType.DM) return;

	try {
		const embed = new EmbedLog("Message delete");
		const fetchedLogs = await message.guild.fetchAuditLogs({
			type: AuditLogEvent.MessageDelete,
			limit: 1,
		});

		const firstEntry = fetchedLogs.entries.first();
		if (!firstEntry) {
			embed.setDescription(`Message from ${member} deleted by **Unknown** in ${message.channel}\nContent: ${message.content}`);
			await EmbedLog.LOG_CHANNEL.send({embeds: [embed]});
			return;
		};

		if (message.embeds.length > 0)
			if (message.embeds.length < 10) {
				embed.setDescription(`Message from ${member} deleted by ${firstEntry.executor} in ${message.channel}\nContent: ${message.content}\nEmbeds: ↓ Above ↓`);
				await EmbedLog.LOG_CHANNEL.send({embeds: [embed, ...message.embeds]});
			} else {
				embed.setDescription(`Message from ${member} deleted by ${firstEntry.executor} in ${message.channel}\nContent: ${message.content}\nEmbeds: ${message.embeds.length}`);
				await EmbedLog.LOG_CHANNEL.send({embeds: [embed]});
			}
		else {
			embed.setDescription(`Message from ${member} deleted by ${firstEntry.executor} in ${message.channel}\nContent: ${message.content}`);
			await EmbedLog.LOG_CHANNEL.send({embeds: [embed]});
		};
	} catch (error) {
		console.error(`Discord ↪ Error while fetching audit logs for message delete event: ${error.message}`);
	};
};