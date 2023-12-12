const {Rank} = require('canvafy');
const { User } = require('discord.js');

/**
 * Generate rank card
 * @param {User} member
 * @returns {Promise<Buffer>}
 */
module.exports = async (member, experience) => {
	return await new Rank()
		.setAvatar(member.displayAvatarURL())
		//.setBackground("color", "#a611a6")
		.setBackground("image", "https://media.discordapp.net/attachments/1183924614674518057/1184023131682246666/1689328918481.jpg?ex=658a7678&is=65780178&hm=1699e06cfa3acf05c498b4f1eef7218ffda72b82e66ff0d8db68452edea2ff82&=&format=webp&width=640&height=360")
		.setUsername(member.displayName)
		.setBorder("#db70b8")
		.setOverlayOpacity(0.8)
		.setRank(experience.level, "Level")
		.setLevel(experience.total_messages, "Messages")
		.setCurrentXp(experience.xp)
		.setBarColor("#db70b8")
		.setRequiredXp(experience.next_level_xp)
		.build();
};
