const discord = require('../../classes/HBClient');
const { GuildMember, Role } = require('discord.js');

/**
 *
 * @param {GuildMember} member
 * @param {Role} role
 * @return {Promise<void>}
 */
exports._addRole = async function _addRole(member, role) {
	try {
		if (!member || !role) return;
		if (member._roles.includes(role.id)) return;
		await member.roles.add(role);
		console.log('_addRole', member.nickname ? member.nickname : member.displayName, role.name);

	} catch(e) {
		console.log(e.message);
	}
}

/**
 * @param {GuildMember} member
 * @param {Role} role
 * @return {Promise<void>}
 */
exports._removeRole = async function _removeRole(member, role) {
	try {
		if (!member || !role) return;
		if (!member._roles.includes(role.id)) return;
		await member.roles.remove(role);
		console.log('_removeRole', member.nickname ? member.nickname : member.displayName, role.name);

	} catch(e) {
		console.log(e.message);
	}
}


exports._sendMessage = async function _sendMessage(channelId, content) {
	try {
		if (!channelId || !content) return;
		const server = discord.cache.getGuild();
		if (!server) return;
		const channel = server.channels.cache.get(channelId);
		if (!channel) return;
		await channel.send(content);
		console.log('_sendMessage', server.name, channel.name, content);
	} catch(e) {
		console.log(e.message);
	}
}
