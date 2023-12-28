
const AttachmentDownload = require('./AttachmentDownload');
const ApiController = require('../../Slack');
const messagesHistory = require('data-store')({ path: process.cwd() + '/src/databases/slackMessagesHistory.json' });
const { _sendMessage, _editMessage } = require('../../functions/discordRolesUtils');
const discord = require('../../../classes/HBClient');


class MessageTracker {
	constructor(channelId, refreshInterval, discordChannelId, limit = 5) {
		this.channelId = channelId;
		this.refreshInterval = refreshInterval;
		this.discordChannelId = discordChannelId;
		
		this._limit = limit;
		this._options = {
			channel: this.channelId, 
			limit: this._limit,
			include_all_metadata: true,
			inclusive: true
		}

		setInterval(() => this._getLatest(), this.refreshInterval);
		this._getLatest();
	}

	async _getLatest() {

		const result = await ApiController('conversations.history', this._options);
		if (!result || !result.ok) {
			console.error(result);
			return;
		};

		const sortBySendingOrder = result.messages.reverse();
		for (const message of sortBySendingOrder)
		{
			if (!message.client_msg_id) continue;
			const isReadyInDatabase = messagesHistory.get(message.client_msg_id);

			if (!isReadyInDatabase)
			{
				await this._sendMessage(message);
				continue;
			}
			await this._editMessage(message);

		}

	}

	async _sendMessage(m) {

		const isNewMessage = messagesHistory.get(m.client_msg_id);
		
		if (isNewMessage) return;

		console.log('New message: ' + m.client_msg_id)

		const content = {content: await this._formatMessage(m), files: await this._getAttachments(m)};

		const discordMessage = await _sendMessage(this.discordChannelId, content);
		
		if (discordMessage)
		{
			m.discord_message_id = discordMessage.id;
			m.discord_channel_id = discordMessage.channel.id;
			discordMessage.react('👍');
		}

		m.channel_id = this.channelId;

		messagesHistory.set(m.client_msg_id, m);
	}

	async _editMessage(m) {
		
		const databaseMessage = messagesHistory.get(m.client_msg_id);
		
		if (!m.edited || !databaseMessage) return;

		const latestEdit = databaseMessage.edited || databaseMessage;

		if (m.edited.ts === latestEdit.ts) return;

		const { discord_message_id } = databaseMessage;

		console.log('Edit message: ' + m.client_msg_id);

		const content = {content: await this._formatMessage(m), files: await this._getAttachments(m)};

		const discordMessage = await _editMessage(this.discordChannelId, discord_message_id, content);

		if (discordMessage)
		{
			m.discord_message_id = discordMessage.id;
			m.discord_channel_id = discordMessage.channel.id;
		}

		m.channel_id = this.channelId;

		messagesHistory.set(m.client_msg_id, m);

	}


	async _getAttachments(m) {

		if (!m.files || Object.keys(m.files).length === 0) return undefined;
		let files = [];
		for (const file of m.files)
		{
			const response = await AttachmentDownload(file.url_private_download, file.id);
			if (!response) continue;
			files.push(response);
		}
		return files;
	}

	async _formatMessage(m) 
	{
		let { text, user } = m;

		if (text.length > 1800)
			return 'Ce message ne peut être affiché car celui-ci est trop long. Rendez-vous, cliquez sur le lien ci-dessous pour qu\'il s\'affiche.';

		text = text.replaceAll('<!here>', '<@&1143248679180972053>');
		text = text.replaceAll('<!channel>', '<@&1143248679180972053>');
		text = text.replaceAll('&gt;', ' ').trim(); 
        text = text.replaceAll('::', ': :').trim();

		const regex = /<@U[0-9A-Z]+>/g;
        const userPinneds = text.match(regex) || [];
		const users = discord.cache.getUsers();

		for (const mention of userPinneds)
		{
			const id = mention.substring(2, mention.length - 1);
			const userData = await ApiController('users.profile.get', {user: id});
			const { profile } = userData;
			if (profile.email && profile.email.split('@')[0].length === 4)
			{

				const user = users.get(parseInt(profile.email.split('@')[0]));
				if (user && user.member)
					text = text.replaceAll(mention, `<@${user.member.user.id}>`);
				else
					text = text.replaceAll(mention, `${profile.display_name}`);
			}
		}

		// Expression régulière pour rechercher tous les liens dans le texte
		const regexLinks = /<http.:\/\/([^|]+)\|([^>]+)>/g;
		text = text.replace(regexLinks, (match, url, titre) => {
			const markdownLink = `[${titre}](${url})`;
			return markdownLink;
		});
		  

		const channelRegex = /<#[0-9A-Z\|]+>/g;
        const channelPinneds = text.match(channelRegex) || [];

		for (const mention of channelPinneds)
		{
			const channel = mention.substring(2, mention.length - 2);
			const channel_info = await ApiController('conversations.info', {channel});
			if (!channel_info) continue;
			text = text.replaceAll(mention, `**[#${channel_info.channel.name}](https://app.slack.com/client/T0423U1MW21/${channel})**`);
		}

		text = text
			.replaceAll(/ \*([^*]+)\*/g, ' **$1**')
			.replaceAll(/ _([^_]+)_/g, ' *$1*')
			.replaceAll('•', '- ')
			.replaceAll('◦', '◦  ');

		discord.cache.get('guild').roles.cache.forEach(cohort => {
			if (/^C#\d+$/.test(cohort.name)) {
				text = text.replaceAll(cohort.name, `<@&${cohort.id}>`);
			}
		});

		const userData = await ApiController('users.profile.get', {user});

		text += `\n[From ${userData.profile.display_name}](https://holberton-school-org.slack.com/team/${user})  •  `;
		text += `[View original message](https://holberton-school-org.slack.com/archives/${this.channelId}/p${m.ts.replace('.', '')})`;
																										

		return text;
	}
}

module.exports = MessageTracker;