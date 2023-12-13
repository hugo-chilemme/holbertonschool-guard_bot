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
		.setBackground("color", "#2c2f33")
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
