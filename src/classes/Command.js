const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const SubCommand = require("./SubCommand");

/**
 * @class Command
 * @description A class to represent a command.
 * @property {SlashCommandBuilder} handler The slash command builder.
 * @property {function(CommandInteraction): void} callback The callback function.
 * @property {Map<string, Command>} sub_commands The sub commands.
 * @example const command = new Command(new Command.Builder().setName("ping")), interaction => console.log("Pong!" + interaction.user.tag));
 * @see SlashCommandBuilder
 * @see CommandInteraction
 * @see SubCommand
 */
module.exports = class Command {

	static get Builder() {
		return SlashCommandBuilder;
	};

	/**
     *
     * @param {SlashCommandBuilder} handler
     * @param {function(CommandInteraction): Promise<void>} callback
	 * @param {SubCommand[]} child_commands
     */
    constructor(handler, callback, child_commands = []) {
        this.handler = handler;
        this.callback = callback;
        this.sub_commands = new Map();
		child_commands.forEach(child_command => {
			const child_handler = child_command.handler;
			this.handler.addSubcommand(child_handler);
			this.sub_commands.set(child_command.handler.name, child_command);
		});
    };

};