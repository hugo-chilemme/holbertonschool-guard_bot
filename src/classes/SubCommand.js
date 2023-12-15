const Command = require("./Command");
const { SlashCommandSubcommandBuilder, CommandInteraction } = require("discord.js");

/**
 * @class SubCommand
 * @description A class to represent a sub command.
 * @property {SlashCommandSubcommandBuilder} handler The slash command builder.
 * @property {function(CommandInteraction): void} callback The callback function.
 * @example const command = new SubCommand(SubCommand.Builder().setName("ping")).setDescription("A simple sub command"), interaction => console.log("Pong!" + interaction.user.tag));
 * @see CommandInteraction
 * @see Command
 */
module.exports = class SubCommand {

	static get Builder() {
		return SlashCommandSubcommandBuilder;
	};

	/**
     *
     * @param {SlashCommandSubcommandBuilder} handler
	 * @param {string} description
	 * @param {function(CommandInteraction): Promise<void>} callback
     */
    constructor(handler, callback) {
		this.handler = handler;
		this.callback = callback;
    };

};