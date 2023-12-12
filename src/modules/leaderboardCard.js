const { Top } = require("canvafy");
const User = require("../services/classes/User");

/**
 *
 * @param {User[]} members
 * @param {string} type
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
		.setBackground("image", "https://media.discordapp.net/attachments/1183924614674518057/1184023131682246666/1689328918481.jpg?ex=658a7678&is=65780178&hm=1699e06cfa3acf05c498b4f1eef7218ffda72b82e66ff0d8db68452edea2ff82&=&format=webp&width=640&height=360")
		.setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
		.setUsersData(data)
		.build();
};