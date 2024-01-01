const { Interaction, SlashCommandSubcommandBuilder } = require("discord.js");
const SubCommand = require("../classes/SubCommand");
const EventService = require("../services/EventService");
const Command = require("../classes/Command");

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
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
	if (interaction.isChatInputCommand())
    {
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
        return;
    };

    if (interaction.isStringSelectMenu()) {
        if (interaction.values[0] === 'no_value') {
            await interaction.reply({ content: "La sélection a été annulée.🔋", ephemeral: true });
            return;
        };
        EventService.emit("stringSelectMenuAction", {
            menu_id: interaction.customId,
            value: interaction.values,
            interaction: interaction,
        });
        return;
    };

    if (interaction.isButton()) {
        EventService.emit("buttonClick", {
            button_id: interaction.customId,
            interaction: interaction,
        });
        return;
    };

};