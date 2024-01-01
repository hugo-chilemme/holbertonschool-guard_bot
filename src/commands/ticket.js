const Command = require('../classes/Command');
const DataStore = require('../classes/DataStore');
const SubCommand = require('../classes/SubCommand');
const {
	PermissionFlagsBits,
	CommandInteraction,
	ChannelType,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	TextChannel,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} = require('discord.js');

/**
 * Creates a ticket button
 * @param {TextChannel} channel
 * @param {CommandInteraction} interaction
 */
async function createButtons(channel, interaction) {
	const store = DataStore.getStore('ticket');
	if (!store) return;

	const buttons = store.get("buttons");

	if (interaction)
		if (buttons[channel.id]) return await interaction.followUp({ content: 'Button already exists in this channel', ephemeral: true });

	const categories = store.get("categories");
	const data = [];

	data.push(
		new StringSelectMenuOptionBuilder({
			label: "🛑 Aucune option.",
			description: "Permet de désélectionner toutes les options.",
			//default: true,
			value: "no_value"
		})
	);

	for (const name of Object.keys(categories))
	{
		const value = categories[name];
		if (!value.id || !value.label || !value.description) continue;
		if (value.label.length < 0 || value.label.length > 25) {
			console.error(`Discord ↪ Category label must be between 0 and 25 characters: ${value.label}`);
			continue;
		};
		if (value.description.length < 0 || value.description.length > 50) {
			console.error(`Discord ↪ Category description must be between 0 and 50 characters: ${value.description}`);
			continue;
		};
		data.push(
			new StringSelectMenuOptionBuilder()
				.setLabel(`🔋 ${categories[name].label}`)
				.setDescription(categories[name].description)
				.setValue(categories[name].id)
		);
	};

	const row_1 = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('ticket_menu')
				.setPlaceholder('Choisissez une catégorie ✨')
				.setMinValues(1)
				.setMaxValues(1)
				.addOptions(data.length > 0 ? data : [
					new StringSelectMenuOptionBuilder()
						.setLabel('Aucune catégorie disponible')
						.setValue('no_value')
				])
		);
	const row_2 = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setLabel('Accéder à l\'intranet')
				.setStyle(ButtonStyle.Link)
				.setURL('https://intranet.hbtn.io/')
		);

	try {
		const message = await channel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Tickets')
					.setDescription('Cliquez sur un des boutons ci-dessous pour créer un ticket')
			],
			components: [row_1, row_2]
		});

		console.log(`Discord ↪ Created ticket button in channel: ${channel.name}`);

		buttons[channel.id] = message.id;
		store.set("buttons", buttons);

		if (interaction)
			await interaction.followUp({ content: `Created ticket button in channel **${channel.name}**`, ephemeral: true });
	} catch (err) {
		console.error(`Discord ↪ Unable to create ticket button: ${err}`);
		if (interaction)
			await interaction.followUp({ content: `Failed to create ticket button in channel **${channel.name}**`, ephemeral: true });
	};
};

/**
 * Updates all ticket buttons
 * @param {CommandInteraction} interaction
 * @returns {Promise<void>}
 */
async function updateButtons(interaction) {
	const store = DataStore.getStore('ticket');
	const current_buttons = store.get("buttons");
	for (const channel_id of Object.keys(current_buttons))
	{
		try {
			/** @type {TextChannel} */
			const channel = await interaction.guild.channels.fetch(channel_id);
			if (!channel) continue;

			const message_id = current_buttons[channel_id];
			const messages = await channel.messages.fetch({id: message_id});
			if (!messages) continue;
			messages.forEach(async message => {
				if (!message) return;
				if (message.id !== message_id) return;
				await message.delete();
				createButtons(channel);
			});
		} catch (err) {
			console.error(`Discord ↪ Unable to delete ticket button: ${err}`);
		};
	};
};

/**
 *
 * @param {CommandInteraction} interaction
 */
async function createCategory(interaction) {
	const name = interaction.options.getString('category');
	const store = DataStore.getStore('ticket');
	if (store)
	{
		const categories = store.get("categories");
		if (categories[name]) return interaction.followUp({ content: 'Category already exists', ephemeral: true });
		await interaction.guild.channels.create({
			name: name,
			type: ChannelType.GuildCategory,
			permissionOverwrites: [
				{
					id: interaction.guild.roles.everyone.id,
					deny: [PermissionFlagsBits.ViewChannel]
				}
			]
		}).then(async channel => {
			console.log(`Discord ↪ Created category: ${channel.name}`);
			categories[name] = {
				id: channel.id,
				label: interaction.options.getString('category_label'),
				description: interaction.options.getString('category_description')
			};
			store.set("categories", categories);
			await updateButtons(interaction);
			interaction.followUp({ content: `Created category **${name}**`, ephemeral: true });
		}).catch(err => {
			console.error(`Discord ↪ Unable to create category: ${err}`);
			interaction.followUp({ content: `Failed to create category **${name}**`, ephemeral: true });
		});
	};
};

/**
 * Deletes a ticket category
 * @param {CommandInteraction} interaction
 */
async function deleteCategory(interaction) {
	const channel = interaction.options.getChannel('category');
	const store = DataStore.getStore('ticket');
	if (!store) return;
	try {
		const categories = store.get("categories");
		if (!categories[channel.name]) return interaction.followUp({ content: 'Category does not exist', ephemeral: true });
		await channel.delete();
		console.log(`Discord ↪ Deleted category: ${channel.name}`);
		delete categories[channel.name];
		store.set("categories", categories);
		await updateButtons(interaction);
		await interaction.followUp({ content: `Deleted category **${channel.name}**`, ephemeral: true });
	} catch (err) {
		console.error(`Discord ↪ Unable to delete category: ${err}`);
		await interaction.followUp({ content: `Failed to delete category **${channel.name}**`, ephemeral: true });
	};
};

module.exports = new Command(
	new Command.Builder()
		.setName('ticket')
		.setDescription('Ticket command')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	undefined,
	[
		new SubCommand(
			new SubCommand.Builder()
				.setName('create_button')
				.setDescription('Create a new button message for tickets')
				.addChannelOption(option =>
					option.setName('channel')
						.setDescription('Channel to create the button message in.')
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true)
				),
			async interaction => {
				await createButtons(interaction.options.getChannel('channel'), interaction);
			}
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName('create_category')
				.setDescription('Create a new category for tickets')
				.addStringOption(option =>
					option.setName('category')
						.setDescription('Category to create the ticket in')
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('category_description')
						.setDescription('description of the category')
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('category_label')
						.setDescription('Label of the category')
						.setRequired(true)
				),
			async interaction => await createCategory(interaction)
		),
		new SubCommand(
			new SubCommand.Builder()
				.setName("delete_category")
				.setDescription("Delete a category for tickets")
				.addChannelOption(option =>
					option.setName('category')
						.setDescription('Category to delete the ticket in')
						.addChannelTypes(ChannelType.GuildCategory)
						.setRequired(true)
				),
			async interaction => await deleteCategory(interaction)
		)
	]
);