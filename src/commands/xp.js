const Command = require("../classes/Command");
const SubCommand = require("../classes/SubCommand");
const discord = require("../classes/HBClient");
const rankCard = require("../modules/rankCard");
const leaderboardCard = require("../modules/leaderboardCard");

/**
 * Get user rank card
 * @param {Interaction} interaction
 * @param {User} memberUser
 */
async function getUserRankCard(interaction, memberUser) {
	try {
		const user = discord.cache.getUsers().get(memberUser.id);
		if (!user) {
			throw new Error("User not found");
		};
		const type = interaction.options.getString("type");
		const data = user[type];
		const rank = await rankCard(memberUser, data);
		await interaction.followUp({ files: [rank], ephemeral: true });
	} catch (error) {
		console.error(error.message);
	};
};

module.exports = new Command(
	new Command.Builder()
		.setName("xp")
		.setDescription("Afficher l'experiance d'un membre")
		.setDMPermission(false),
	undefined,
	[
		new SubCommand(
			new SubCommand.Builder()
				.setName("me")
				.setDescription("Afficher votre experiance")
				.addStringOption(option =>
					option.setName("type")
						.setDescription("Type d'XP")
						.setRequired(true)
						.setChoices(
							{ name:"Holbie", value:"message_experience" },
							{ name:"Helper", value:"help_experience" }
						)
				),
			async interaction => getUserRankCard(interaction, interaction.user)
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName("user")
				.setDescription("Afficher l'experience d'un membre")
				.addUserOption(option =>
					option.setName("user")
						.setDescription("Utilisateur")
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName("type")
						.setDescription("Type d'XP")
						.setRequired(true)
						.setChoices(
							{ name:"Holbie", value:"message_experience" },
							{ name:"Helper", value:"help_experience" }
						)
				),
			async interaction => getUserRankCard(interaction, interaction.options.getUser("user"))
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName("leaderboard")
				.setDescription("Afficher le classement")
				.addStringOption(option =>
					option.setName("type")
						.setDescription("Type d'XP")
						.setRequired(true)
						.setChoices(
							{ name:"Holbie", value:"message_experience" },
							{ name:"Helper", value:"help_experience" }
						)
				),
			async interaction => {
				try {
					const type = interaction.options.getString("type");
					const members = discord.cache.getMembers();
					const users = discord.cache.getUsers();
					const data = members.map(member => {
						const user = users.get(member.user.id);
						return user;
					}).sort((a, b) => b[type].total_xp - a[type].total_xp);
					const leaderboard = await leaderboardCard(data, type);
					await interaction.followUp({files: [leaderboard]});
				} catch (error) {
					console.error(error.message);
				};
			}
		)
	]
);