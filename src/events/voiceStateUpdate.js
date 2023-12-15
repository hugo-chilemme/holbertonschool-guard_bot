const { ChannelType } = require('discord.js');

module.exports = async (_, oldState, newState) => {
	if (!newState.channelId || newState.channelId !== '1115392857210093579') return;
	const member = newState.member;

	const guild = await newState.guild.fetch('976357520895528960');

	const channel = await guild.channels.create({
	  name: 'Fun Room '+member.nickname,
	  type: ChannelType.GuildVoice,
	  parent: '1114964063198392411',
	});
	await member.voice.setChannel(channel);
};
