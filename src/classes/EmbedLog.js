const {
	TextChannel,
	EmbedBuilder,
	Colors,
} = require("discord.js");
const discord = require("./HBClient");

/**
 * @class EmbedLog
 * @extends {EmbedBuilder}
 * @description Create a new log embed
 * @example const log = new EmbedLog("This is a log message", "https://example.com/image.png", EmbedLog.Colors.DarkRed);
 * @example const log = new EmbedLog("This is a log message", "https://example.com/image.png");
 * @example const log = new EmbedLog("This is a log message");
 * @example const log = new EmbedLog();
 * @example log.setColor(EmbedLog.Colors.DarkRed);
 * @see EmbedBuilder
 */
module.exports = class EmbedLog extends EmbedBuilder {

	/**
	 * Get the log channel
	 * @returns {TextChannel}
	 */
	static get LOG_CHANNEL() {
		const guild = discord.cache.getGuild();
		const channel = guild.channels.cache.get(process.env.LOG_CHANNEL);
		if (!channel) throw new Error("Log channel not found");
		return channel;
	};

	static get Colors() {
		return Colors;
	};

	/**
	 * Create a new log embed
	 * @param {string} title
	 * @param {string} description
	 * @param {EmbedLog.Colors} color
	 */
	constructor(title = null, description = null, color = Colors.DarkRed) {
		super();
		this.setTitle(title);
		this.setColor(color);
		this.setTimestamp();
		this.setDescription(description);
		this.setFooter({text: "This is an automated message.", iconURL: discord.user.displayAvatarURL()});
		this.setAuthor({
			name:"Log",
			iconURL: "https://e7.pngegg.com/pngimages/323/875/png-clipart-computer-icons-lumberjack-logfile-log-in-cdr-angle.png"
		});
	};

};