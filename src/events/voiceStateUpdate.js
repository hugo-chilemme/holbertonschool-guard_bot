const { ChannelType } = require('discord.js');
const voices = require('data-store')({ path: process.cwd() + '/src/databases/discordVoices.json' });

module.exports = async (_, oldState, newState) => {

	if (oldState.channelId) {
		const voice = voices.get(oldState.channelId);
		if (!voice)
			return;
		const voiceChannel = oldState.channel;

		if (voiceChannel && voiceChannel.members.size === 0) {
		  voices.del(oldState.channelId);
		  await voiceChannel.delete();
		};
	};
	if (!newState.channelId || newState.channelId !== '1185153167806185575') return;
	const member = newState.member;
	if (member.user.bot) return;
	const guild = await newState.guild.fetch('976357520895528960');

	const channel = await guild.channels.create({
		name: 'Fun Room ' + member.nickname,
		type: ChannelType.GuildVoice,
		parent: '1114964063198392411',
	});
	voices.set(channel.id, new Date());
	await member.voice.setChannel(channel);
};


