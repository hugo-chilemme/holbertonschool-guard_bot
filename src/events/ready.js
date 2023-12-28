const discord = require("../classes/HBClient");
const { joinVoiceChannel } = require('@discordjs/voice');
const { _sendMessage, _editMessage } = require('../services/functions/discordRolesUtils');

module.exports = async () => {
	try {
		const guild = discord.guilds.cache.get(process.env.GUILD_ID);
		joinVoiceChannel({
			channelId: process.env.NODE_ENV !== "development" ? "1185153167806185575": process.env.VOICE_CHANNEL,
			guildId: process.env.GUILD_ID,
			adapterCreator: guild.voiceAdapterCreator
		});
		console.log(`Discord ↪ Joined voice channel`);

	} catch (error) {
		console.error(`Discord ↪ Unable to join voice channel. ${error.message}`);
	};
};