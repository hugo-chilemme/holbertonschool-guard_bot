

async function handleLoadMembers() {
	const server = await discord.guilds.cache.get('976357520895528960');
	members = await server.members.fetch();

	roles.cohorts = await server.roles.cache.filter(role => role.name.match(/^C#\d+$/));
    roles.specialization = await server.roles.cache.find(role => role.id === '1176062134480801792');
    roles.ActiveStudent = await server.roles.cache.find(role => role.id === '1143248679180972053');
    roles.Alternance = await server.roles.cache.find(role => role.id === '1183100023152590971');

	console.log('Discord ↪', `${members.size} members loaded`);

	SystemService.emit('holberton.load');
}

discord.on('ready', handleLoadMembers);
SystemService.on('discord.refresh', handleLoadMembers);