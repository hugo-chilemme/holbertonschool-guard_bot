const { Interaction, SlashCommandSubcommandBuilder, CommandInteraction } = require("discord.js");
const Command = require("../classes/Command");
const SubCommand = require("../classes/SubCommand");

/**
 *
 * @param {Command} command
 * @param {Interaction} interaction
 */
function handleSubCommand(command, interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand) {
        for (let option of command.handler.options) {
            if (option instanceof SlashCommandSubcommandBuilder) {
                if (option.name === subCommand) {
                    const child = command.sub_commands.get(subCommand);
                    if (child instanceof SubCommand) {
                        child.callback(interaction);
                        return true;
                    }
                };
            };
        };
    };
    return false;
};

/**
 * Listen for interaction events
 * @param {HBClient} client
 * @param {CommandInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
	if (!interaction.isChatInputCommand()) return;

    try {
        await interaction.deferReply({ ephemeral: true, fetchReply: true });
    } catch (error) {
        console.error(`Error while deferring reply: ${error.message}`);
        return;
    };

	const command = client.commands.get(interaction.commandName);

	if (!command || !command instanceof Command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
        return;
	};

	try {
        if(handleSubCommand(command, interaction))
            return;
		await command.callback(interaction);
	} catch (error) {
		console.error(error.message);
		if (interaction.replied || interaction.deferred)
			await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
		else
			await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
	};
};