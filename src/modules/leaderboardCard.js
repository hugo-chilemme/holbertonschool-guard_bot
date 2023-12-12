const { Top } = require("canvafy");
const User = require("../services/classes/User");

/**
 *
 * @param {User[]} members
 * @param {string} type
 * @returns
 */
module.exports = async (members, experienceType) => {

	const data = [];

	for (let i = 0; i < 10; i++) {
		const user = members[i];
		data.push({
			top: i + 1,
			avatar: user.member.displayAvatarURL(),
			tag: user.member.displayName,
			score: user[experienceType].total_xp
		});
	};

	return await new Top()
		.setOpacity(0.6)
		.setScoreMessage("XP:")
		.setabbreviateNumber(true)
		.setBackground("image", "https://cdn.wallpapersafari.com/1/71/YB4ECo.jpg")
		.setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
		.setUsersData(data)
		.build();
};