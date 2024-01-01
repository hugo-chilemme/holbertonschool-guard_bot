const EventService = require('../services/EventService');
const {
	Interaction,
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events
} = require('discord.js');
const discord = require('../classes/HBClient');
const EmbedLog = require('../classes/EmbedLog');
const DataStore = require('../classes/DataStore');

EventService.on('stringSelectMenuAction', async data => {
	/** @type {String} */
	const menu_id = data.menu_id;
	/** @type {Interaction} */
	const interaction = data.interaction;
	/** @type {String} */
	const category_id = data.value;

	if (menu_id !== 'ticket_menu') return;

	const store = DataStore.getStore('ticket');
	if (!store) return;

	try {

		let cache = store.get("cache");
		if (!cache)
			cache = {};

		if (cache[interaction.user.id]) return await interaction.reply({ content: 'Vous avez déjà un ticket en cours', ephemeral: true });

		const category = await interaction.guild.channels.fetch(category_id);
		if (!category) return await interaction.reply({ content: 'Categorie invalide', ephemeral: true });

		const guild = interaction.guild;
		const member = interaction.member;
		const user = interaction.user;
		const name = member.nickname ? member.nickname : user.username;
		const channel = await guild.channels.create({
			name: `ticket-${name}`,
			type: ChannelType.GuildText,
			parent: category,
			permissionOverwrites: [
				{
					id: guild.roles.everyone.id,
					deny: [PermissionFlagsBits.ViewChannel]
				},
				{
					id: user.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.MentionEveryone
					]
				}
			]
		});
		const embed = new EmbedBuilder()
			.setTitle(`Ticket de ${name}`)
			.setDescription(`Bienvenue dans votre ticket, ${name} !\nUn membre du staff va arriver sous peu pour vous aider.`);
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('ticket_close')
					.setLabel('Fermer le ticket')
					.setStyle(ButtonStyle.Danger)
			);
		await channel.send({ embeds: [embed], components: [row], content: `${user}` });
		await channel.send({ content: `Le système de ticket est en cours de développement, merci de votre compréhension.` });
		await interaction.reply({ content: `Ticket créé dans ${channel}`, ephemeral: true });
		cache[interaction.user.id] = {
			category: category.id,
			channel: channel.id,
			member_id: member.id,
		};
		store.set("cache", cache);
		const log_embed = new EmbedLog(
			`Ticket Opened`,
			`Ticket opened by (**${name}**, **${user.id}**) in category **${category.name}**`,
			EmbedLog.Colors.Green
		).setThumbnail(user.avatarURL());
		await EmbedLog.LOG_CHANNEL.send({embeds: [log_embed]});
	} catch (err) {
		await interaction.reply({ content: `Impossible de créer le ticket pour le moment, réessayez plus tard.`, ephemeral: true });
		console.error(`Discord ↪ Error while handling button: ${err.message}`);
	};
});

EventService.on('buttonClick', async data => {
	/** @type {String} */
	const button_id = data.button_id;
	/** @type {Interaction} */
	const interaction = data.interaction;

	if (button_id === 'ticket_close') {

		const store = DataStore.getStore('ticket');
		if (!store) return await interaction.reply({ content: 'Impossible de fermer le ticket pour le moment, réessayez plus tard.', ephemeral: true });

		const cache = store.get("cache");
		if (!cache) return await interaction.reply({ content: 'Impossible de fermer le ticket pour le moment, réessayez plus tard.', ephemeral: true });

		try {
			const member = interaction.member;
			const user = interaction.user;
			const member_name = member.nickname ? member.nickname : user.username;
			for (const [key, value] of Object.entries(cache)) {
				if (value.channel !== interaction.channel.id) continue;
				const ticket_author = interaction.guild.members.cache.get(key);
				const author_name = ticket_author.nickname ? ticket_author.nickname : ticket_author.user.username;
				interaction.reply({content: "Le ticket va être fermé dans 5 secondes..."});
				delete cache[ticket_author.id];
				store.set("cache", cache);
				setTimeout(async () => {
					await interaction.channel.delete();
					const embed = new EmbedLog(
						`Ticket Closed`,
						`Ticket of (**${author_name}**, **${ticket_author.id}**) closed by (**${member_name}**, **${user.id}**)`,
						EmbedLog.Colors.DarkRed
					).setThumbnail(user.avatarURL());
					await EmbedLog.LOG_CHANNEL.send({embeds: [embed]});
				}, 5000);
			};
		} catch (err) {
			console.error(`Discord ↪ Error while handling button: ${err.message}`);
		};
		return;
	};
});

discord.on(Events.ClientReady, () => {
	const store = DataStore.setStore('ticket', new DataStore('ticket'));
	if (!store.get("categories")) store.set("categories", {});
	if (!store.get("buttons")) store.set("buttons", {});
});