const ApiController = require('../services/Holberton');
const User = require('../services/classes/User');
const { _removeRole } = require('../services/functions/discordRolesUtils');


async function handleLoadUsers() {
	const users = await ApiController('users', {campus: 'TLS'});
	const usersEligibility = users.filter(user => user.discord_tag);

	let activeCount = 0;
	let userIds = members.map(member => member.user.id);
	console.log('Holberton ↪', `${usersEligibility.length} users received`);
	
	for (let user of usersEligibility) {
		let member = members.find(u => 
			u.user.username.toLowerCase() === user.discord_tag.split('#')[0].toLowerCase()
		);
		if (!member) {
			user = await ApiController('users/'+user.id, {refresh: true});
			member = members.find(u => 
				u.user.username.toLowerCase() === user.discord_tag.split('#')[0].toLowerCase()
			);
			if (!member) continue;
		}
		
		const index = userIds.indexOf(member.user.id);
		if (index > -1) { 
			userIds.splice(index, 1); 
		}


		if (!users[user.id])
		{
			const instUser = new User(user, member);

			users[user.id] = instUser;
			users[member.user.id] = instUser;
			users[user.slack_id] = instUser;
		}
		users[user.id].user = user; //refresh data 
	}

	for (const id of userIds)
	{
		function whitelist() {
			const index = userIds.indexOf(id);
			if (index > -1) { 
				userIds.splice(index, 1); 
			}
		}
		const u = members.get(id);
		if (u.user.bot || u.roles.cache.has('1165695741939945564') || u.roles.cache.has('1107994742018560060')) {
			whitelist()
			continue;
		}
		try {
			u.roles.cache.map((role) => {
				if (role.name === "@everyone") return;
				if (!roles.cohorts.has(role.id) && !roles.ActiveStudent.id !== role.id && !roles.specialization.id !== role.id) return;
				_removeRole(u, role);
			});
		} catch(e) {
			console.log(e.message);
		}

	}
	discord.user.setActivity(`${usersEligibility.length - userIds.length} students`, { type: 4});

	console.log('Holberton ↪', `${userIds.length} users not validated`);


	setTimeout(() => SystemService.emit('discord.refresh'), 60000);
}

SystemService.on('holberton.load', handleLoadUsers);