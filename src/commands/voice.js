const discord = require("../classes/HBClient");
const Command = require("../classes/Command");
const SubCommand = require("../classes/SubCommand");
const { PermissionFlagsBits, ChannelType, VoiceChannel } = require("discord.js");

module.exports = new Command(
	new Command.Builder()
		.setName("voice")
		.setDescription("Effectuer des actions sur les salons vocaux")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	undefined,
	[
		new SubCommand(
			new SubCommand.Builder()
				.setName("clear")
				.setDescription("Expulser tout les membres d'un salon vocal")
				.addChannelOption(option =>
					option.setName("channel")
						.setDescription("Salon vocal")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildVoice)
				),
			async interaction => {
				let disconnected = 0;
				/** @type {VoiceChannel} */
				const channel = interaction.options.getChannel("channel");
				if (channel.type != ChannelType.GuildVoice) return interaction.reply({ content: "Le salon doit être un salon vocal.", ephemeral: true });
				if (channel.members.size == 0) return interaction.followUp({ content: "Le salon est vide.", ephemeral: true });

				for (const member of channel.members.values()) {
					if (!member.permissions.has(PermissionFlagsBits.Administrator))
						try {
							await member.voice.disconnect("Voice clear command executed by " + interaction.user.tag);
							disconnected++;
						} catch (error) {
							console.error(`Discord  ↪ Unable to disconnect member (${member.tag}, ${member.id}) from voice channel (${channel.name}, ${channel.id})`);
						};
				};
				await interaction.followUp({ content: `${disconnected} membres ${disconnected == 1 ? "a" : "ont"} été expulsés du channel ${channel}. ✔️`, ephemeral: true });
			}
		)
	]
);
