const sodHistory = require('data-store')({ path: process.cwd() + '/src/databases/sodHistory.json' });
const discord = require('../classes/HBClient');
const { _sendMessage, _editMessage } = require('../services/functions/discordRolesUtils');


function checkReminderSod (addDay) {

	const date = new Date();
	date.setDate(date.getDate() + addDay);

	const dateString = date.toDateString();

	const sod = sodHistory.get(dateString);

	if (!sod) return;

	const typeVar = addDay === 7 ? 'week' : 'day';
	const isReadySent = sod.reminder[typeVar];

	if (isReadySent) return;

	sod.reminder[typeVar] = true;
	
	sodHistory.set(dateString, sod);

	const user = discord.cache.getUsers().get(sod.user);
	if (!user || !user.member) return;
	
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	const frenchDate = date.toLocaleDateString('fr-FR', options);

	try {
		user.member.send(`Rappel de votre passage au Speaker Of the Day (SOD) prévu le ${frenchDate}`);
	} catch (e) {
		console.error(e.message);
	}
}

function checkReminder () {

	checkReminderSod(7); 
	checkReminderSod(1); 
}


async function handleGenerateSod() {
	const dateToday = new Date();
	
	const dateInTwoWeeks = new Date();
	dateInTwoWeeks.setDate(dateToday.getDate() + 14);

	const notGoodDay = [0, 6, 3].includes(dateInTwoWeeks.getDay());
	const isReadyInDatabase = sodHistory.has(dateInTwoWeeks.toDateString());

	checkReminder();
	
	if (isReadyInDatabase) return;
	if (notGoodDay) return;

	const users = discord.cache.getUsers();
	const filteredUsers = Array.from(users).filter(([id, user]) => {
		return user.isActive && user.cohortStatus === 'fundamental'
	});
	const randomIndex = Math.floor(Math.random() * filteredUsers.length);
	const [selectedId, selectedUser] = filteredUsers[randomIndex];
	
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	const frenchDate = dateInTwoWeeks.toLocaleDateString('fr-FR', options);

	sodHistory.set(dateInTwoWeeks.toDateString(), { 
		user: selectedUser.user.id, 
		reminder: {
			week: false,
			day: false
		}, 
		message_id: message.id
	});
	
	let message;
	if (selectedUser.member)
	{
		// selectedUser.member.send(`Vous avez été choisi(e) pour effectuer le Speaker Of the Day (SOD) du ${frenchDate}. Veuillez la préparer avant la date prévue au cas où il y aurait un désistement.`);
		message = await _sendMessage('1171027614169833502', `<@${selectedUser.member.user.id}> passera au Speaker Of The Day (SOD) du ${frenchDate}.`);
	}
	else
	{
		message = await _sendMessage('1171027614169833502', `${selectedUser.user.first_name} ${selectedUser.user.last_name} passera au Speaker Of The Day (SOD) du ${frenchDate}.`);
	}



}

discord.on('ready', async () => {
	// _sendMessage('1143262201889689713', '<@476557394944458754> has been duly notified: excessive mention.');
	handleGenerateSod();
	setInterval(handleGenerateSod, 15000);
});