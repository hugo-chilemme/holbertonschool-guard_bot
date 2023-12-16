const Command = require("../classes/Command");
const SubCommand = require("../classes/SubCommand");
const {
	PermissionFlagsBits,
	ChannelType,
	VoiceChannel,
	OverwriteType,
	CommandInteraction
} = require("discord.js");

/**
 * @param {CommandInteraction} interaction
 * @param {VoiceChannel} channel
 * @param {boolean} canConnect
 * @returns {Promise<boolean>}
 */
async function setChannelLockStatus(interaction, channel, canConnect) {
	try {
		const guild = channel.guild;
		const overwrites = channel.permissionOverwrites.cache;
		let scanned = 0;
		let skipped = 0;

		for (const overwrite of overwrites.values()) {
			if (overwrite.type == OverwriteType.Role) {
				try {
					const role = guild.roles.cache.get(overwrite.id);

					const isEveryone = role.name == "@everyone";
					const isForbiden = overwrite.deny.has(PermissionFlagsBits.Connect);
					const isAdmin = role.permissions.has(PermissionFlagsBits.Administrator);
					scanned++;

					if (!isEveryone && !isAdmin && (isForbiden && canConnect || !isForbiden && !canConnect)) {
						if (process.env.NODE_ENV == "development")
							console.log(`Discord ↪ Voice ${canConnect ? "unlock" : "lock"}: Updating role ${role.name} (${role.id})`);
						channel.permissionOverwrites.edit(overwrite.id, { Connect: canConnect }, {
							reason: `Voice ${!canConnect ? "lock" : "unlock"} exectued by ${interaction.user.tag}`,
							type: overwrite.type
						});
					} else {
						skipped++;
						if (process.env.NODE_ENV == "development")
							console.log(`Discord ↪ Voice ${canConnect ? "unlock" : "lock"}: Skipping role ${role.name} (${role.id})`);
					};
				} catch (error) {
					console.error(`Discord ↪ Unable to update channel connect permission for role ${overwrite.id} (${overwrite.name}) ${error.message}`);
				};
			};
		};
		if (skipped === scanned)
			await interaction.followUp({ content: `Le salon ${channel} est déjà ${canConnect ? "déverrouillé" : "verrouillé"}. ❌`, ephemeral: true });
		return skipped !== scanned;
	} catch (error) {
		console.error(`Discord ↪ Unable to set voice channel lock status (${channel.name}, ${channel.id}) ${error.message}`);
		await interaction.followUp({ content: `Impossible d'intéragir avec le salon ${channel} pour le moment. ❌`, ephemeral: true });
	};
	return false;
};

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
				if (!channel) return interaction.followUp({ content: "Le salon n'existe pas.", ephemeral: true });
				if (channel.type != ChannelType.GuildVoice) return interaction.followUp({ content: "Le salon doit être un salon vocal.", ephemeral: true });
				if (channel.members.size == 0) return interaction.followUp({ content: "Le salon est vide.", ephemeral: true });

				for (const member of channel.members.values())
					if (!member.permissions.has(PermissionFlagsBits.Administrator))
						try {
							await member.voice.disconnect("Voice clear command executed by " + interaction.user.tag);
							disconnected++;
						} catch (error) {
							console.error(`Discord  ↪ Unable to disconnect member (${member.tag}, ${member.id}) from voice channel (${channel.name}, ${channel.id})`);
						};
				await interaction.followUp({ content: `${disconnected} membres ${disconnected == 1 ? "a" : "ont"} été expulsés du channel ${channel}. ✔️`, ephemeral: true });
			}
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName("lock")
				.setDescription("Verrouiller un salon vocal")
				.addChannelOption(option =>
					option.setName("channel")
						.setDescription("Salon vocal")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildVoice)
				),
			async interaction => {
				/** @type {VoiceChannel} */
				const channel = interaction.options.getChannel("channel");
				if (!channel) return interaction.followUp({ content: "Le salon n'existe pas.", ephemeral: true });
				if (channel.type != ChannelType.GuildVoice) return interaction.followUp({ content: "Le salon doit être un salon vocal.", ephemeral: true });

				try {
					const hasSetChannel = await setChannelLockStatus(
						interaction,
						channel,
						false
					);
					if (hasSetChannel) {
						await channel.send({ content: `Le salon a été verrouillé par ${interaction.member}` });
						await interaction.followUp({ content: `Le salon ${channel} a été verrouillé. ✔️`, ephemeral: true });
					};
				} catch (error) {
					console.error(`Discord  ↪ Unable to lock voice channel (${channel.name}, ${channel.id}) ${error.message}`);
					await interaction.followUp({ content: `Impossible de verrouiller le salon ${channel}. ❌`, ephemeral: true });
				};
			}
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName("unlock")
				.setDescription("Déverrouiller un salon vocal")
				.addChannelOption(option =>
					option.setName("channel")
						.setDescription("Salon vocal")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildVoice)
				),
			async interaction => {
				/** @type {VoiceChannel} */
				const channel = interaction.options.getChannel("channel");
				if (!channel) return interaction.followUp({ content: "Le salon n'existe pas.", ephemeral: true });
				if (channel.type != ChannelType.GuildVoice) return interaction.followUp({ content: "Le salon doit être un salon vocal.", ephemeral: true });
				try {
					const hasSetChannel = await setChannelLockStatus(
						interaction,
						channel,
						true
					);
					if (hasSetChannel) {
						await channel.send({ content: `Le salon a été déverrouillé par ${interaction.member}` });
						await interaction.followUp({ content: `Le salon ${channel} a été déverrouillé. ✔️`, ephemeral: true });
					};
				} catch (error) {
					console.error(`Discord  ↪ Unable to unlock voice channel (${channel.name}, ${channel.id}) ${error.message}`);
					await interaction.followUp({ content: `Impossible de déverrouiller le salon ${channel}. ❌`, ephemeral: true });
				};
			}
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName("moveall")
				.setDescription("Déplacer tout les membres d'un salon vocal vers un autre")
				.addChannelOption(option =>
					option.setName("from")
						.setDescription("Salon vocal source")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildVoice)
				)
				.addChannelOption(option =>
					option.setName("to")
						.setDescription("Salon vocal destination")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildVoice)
				),
			async interaction => {
				let moved = 0;
				/** @type {VoiceChannel} */
				const from = interaction.options.getChannel("from");
				/** @type {VoiceChannel} */
				const to = interaction.options.getChannel("to");
				if (!from) return interaction.followUp({ content: "Le salon source n'existe pas.", ephemeral: true });
				if (!to) return interaction.followUp({ content: "Le salon destination n'existe pas.", ephemeral: true });
				if (from.type != ChannelType.GuildVoice || to.type != ChannelType.GuildVoice)
					return interaction.followUp({ content: "Les salons doivent être des salons vocaux.", ephemeral: true });
				if (from.members.size == 0) return interaction.followUp({ content: "Le salon source est vide.", ephemeral: true });

				for (const member of from.members.values())
					if (!member.permissions.has(PermissionFlagsBits.Administrator))
						try {
							await member.voice.setChannel(to, "Voice moveall command executed by " + interaction.user.tag);
							moved++;
						} catch (error) {
							console.error(`Discord  ↪ Unable to move member (${member.tag}, ${member.id}) from voice channel (${from.name}, ${from.id}) to (${to.name}, ${to.id})`);
						};
				await interaction.followUp({ content: `${moved} membres ${moved == 1 ? "a" : "ont"} été déplacés du channel ${from} vers ${to}. ✔️`, ephemeral: true });
			}
		)
	]
);
