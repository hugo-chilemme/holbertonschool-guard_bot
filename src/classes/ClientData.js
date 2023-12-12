const { Collection, Guild, Role } = require('discord.js');

/**
 * @class ClientData
 * @description ClientData class
 * @exports ClientData
 * @see Map
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @example const cache = require('./src/classes/ClientData');
 * @extends Map
 */
class ClientData extends Map {

	constructor() {
		super();
	};

	/**
	 * Get primary guild
	 * @returns {Guild}
	 */
	getGuild() {
		return this.get('guild');
	};

	/**
	 * Get a collection of members
	 * @returns {Collection<string, GuildMember>}
	 */
	getMembers() {
		return this.get('members');
	};

	/**
	 * Get a collection of users
	 * @returns {Collection<string, User>}
	 */
	getUsers() {
		return this.get('users');
	};

	/**
	 * Get a collection of roles
	 * @returns {Collection<string, Collection<string, Role>> | Role}
	 */
	getRoles() {
		return this.get('roles');
	};

};

module.exports = new ClientData();