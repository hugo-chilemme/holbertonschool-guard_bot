const Command = require("../classes/Command");
const SubCommand = require("../classes/SubCommand");
const discord = require("../classes/HBClient");
const { EmbedBuilder } = require("discord.js");

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
		const typeLabel = type == "message_experience" ? "Holbie" : "Helper";
		const barSize = 20;
		let levelBar = '[**' + '#'.repeat(barSize * data.xp / data.next_level_xp) + '-'.repeat(barSize - barSize * data.xp / data.next_level_xp) + '**]';
		const embed = new EmbedBuilder()
			.setDescription(`XP de ${memberUser}. Type: **${typeLabel}**\n${levelBar}`)
			.setFooter({ text: "This is an automated message"})
			.addFields(
				{ name: "XP", value: data.xp.toString(), inline: true },
				{ name: "XP total", value: data.total_xp.toString(), inline: true },
				{ name: "Niveau", value: data.level.toString(), inline: true },
				{ name: "XP requis", value: data.next_level_xp.toString(), inline: true },
				{ name: "Messages", value: data.total_messages.toString(), inline: true }
			);
		interaction.followUp({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(`getUserRankCard() -> ${error.message}`);
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
					const fields = [];
					const embed = new EmbedBuilder()
						.setDescription(`Classement des membres (Top 10). Type: **${type == "message_experience" ? "Holbie" : "Helper"}**`)
						.setFooter({ text: "This is an automated message"});
					for (let i = 0; i < 10; i++) {
						const user = data[i];
						fields.push({name: `Top ${i + 1}.`, value: `${user.member} XP: **${user[type].total_xp}**`, inline: true});
					};
					embed.addFields(...fields);
					await interaction.followUp({embeds: [embed], ephemeral: true});
				} catch (error) {
					console.error(error.message);
				};
			}
		)
	]
);