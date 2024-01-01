const { ChannelType } = require('discord.js');
const voices = require('data-store')({ path: process.cwd() + '/src/databases/discordVoices.json' });
const discord = require('../classes/HBClient');
const config = require('../config');

module.exports = async (_, oldState, newState) => {

	const guild = discord.cache.get('guild');

	const hasOldChannelId = oldState.channelId;
	const hasNewChannelId = newState.channelId;

	// Check if the leave channel is a temporary channel
	if (hasOldChannelId && voices.has(oldState.channelId)) 
	{

		const member = oldState.member;

		const voice = voices.get(oldState.channelId);
		const voiceChannel = oldState.channel;
	
		// Check if the channel still contains members
		if (voiceChannel && voiceChannel.members.size === 0) 
		{

			voices.del(oldState.channelId);
			await voiceChannel.delete();

		}

	}

	// Checking if the salon is the creation room
	if (!hasNewChannelId) 
		return;

	const member = newState.member;
	const isChannelCreator = newState.channelId === config.CHANNEL_CREATION_VOICE;
	const isBot = member.user.bot;

	const newChannelName = `🎙️・${member.nickname}`;
	const AttrChannelCategory = config.CATEGORY_TEMPORARY_CHANNEL;

	if (!isChannelCreator || isBot)
		return;

	const newTemporaryChannel = await guild.channels.create({
		name: newChannelName,
		type: ChannelType.GuildVoice,
		parent: AttrChannelCategory,
	});
	voices.set(newTemporaryChannel.id, new Date());
	await member.voice.setChannel(newTemporaryChannel);
};


