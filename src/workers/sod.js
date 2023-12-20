const sodHistory = require('data-store')({ path: process.cwd() + '/src/databases/sodHistory.json' });
const discord = require('../classes/HBClient');
const { _sendMessage, _editMessage } = require('../services/functions/discordRolesUtils');


function handleGenerateSod() {
	const dateToday = new Date();
	const dateInTwoWeeks = new Date();
	dateInTwoWeeks.setDate(dateToday.getDate() + 14);

	// Vérifier si la date est un jour de la semaine (du lundi au vendredi)
	if ([0, 6, 3].includes(dateInTwoWeeks.getDay()))
		return;

	if (sodHistory.has(dateInTwoWeeks.toDateString())) {
		return;
	}

	const users = discord.cache.getUsers();
	const activeUsers = Array.from(users.values()).filter(u => u.isActive && u.cohortStatus === 'fundamental');

	// Randomly choose a user
	const randomIndex = Math.floor(Math.random() * activeUsers.length);
	const randomUser = activeUsers[randomIndex];
	sodHistory.set(dateInTwoWeeks.toDateString(), {user: randomUser.user.id, reminderOneWeek: false, reminderOneDay: false});

	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	const frenchDate = dateInTwoWeeks.toLocaleDateString('fr-FR', options);

	if (randomUser.member) {
		randomUser.member.send(`Vous avez été choisi(e) pour effectuer le Speaker Of the Day (SOD) du ${frenchDate}. Veuillez la préparer avant la date prévue au cas où il y aurait un désistement.`);
		_sendMessage('1171027614169833502', `<@${randomUser.member.user.id}> passera au Speaker Of The Day (SOD) du ${frenchDate}.`);
		return;
	}
	_sendMessage('1171027614169833502', `${randomUser.user.first_name} ${randomUser.user.last_name} passera au Speaker Of The Day (SOD) du ${frenchDate}.`);
}


discord.on('ready', () => {
	setTimeout(() => {
		handleGenerateSod()
	}, 3000);
	setInterval(() => {
		handleGenerateSod()
	}, 60000)
});