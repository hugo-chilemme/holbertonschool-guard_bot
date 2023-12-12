const Command = require("../classes/Command");
const SubCommand = require("../classes/SubCommand");
const discord = require("../classes/HBClient");
const rankCard = require("../../modules/rankCard");

/**
 * Get user rank card
 * @param {Interaction} interaction
 * @param {User} memberUser
 */
async function getUserRankCard(interaction, memberUser) {
	const user = discord.cache.getUsers().get(memberUser.id);
	if (!user) {
		throw new Error("User not found");
	};
	const type = interaction.options.getString("type");
	const data = user[type];
	await interaction.followUp({ files: [
		await rankCard(memberUser, data)
	], ephemeral: true });
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
				.setDescription("Afficher votre experiance")
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
	]
);