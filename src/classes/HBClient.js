const { Client, GatewayIntentBits, Partials, Events, Collection } = require('discord.js');
const { DISCORD_TOKEN, GUILD_ID } = require('../config');
const ClientData = require('./ClientData');

/**
 * @class HBClient
 * @extends Client
 * @description Holberton School Discord bot client
 * @property {ClientData} cache
 */
class HBClient extends Client {

	constructor() {
		super({
			intents: Object.values(GatewayIntentBits).filter(value => typeof value !== 'number'),
			partials: [
				Partials.Message,
				Partials.Channel,
				Partials.Reaction,
				Partials.GuildScheduledEvent
			]
		});
		this.cache = ClientData;
		this.commands = new Collection();
		this.cache.set("users", new Collection());
		this.init();
	};

	async init() {
		this.on(Events.ClientReady, async () => {
			console.log('\n↪\t', 'Guard bot connected ('+ this.user.username + '#' + this.user.discriminator+')');
		});
		this.login(DISCORD_TOKEN);
	};

};

/**
 * @type {HBClient}
 * @description Holberton School Discord bot client
 * @exports HBClient
 * @see HBClient
 * @see Client
 * @see https://discord.js.org/docs/packages/discord.js/main/Client:Class
 * @example const discord = require('./src/classes/HBClient');
 */
module.exports = new HBClient();