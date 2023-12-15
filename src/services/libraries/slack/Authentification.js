
function getDatabase() {
	return require('data-store')({ path: '/applications/holbertonschool-discord_manager/bin/core/slack.json' });
}

exports.getAccessToken = () => {
	const database = getDatabase();
	return database.get('access_token');
}
exports.getRefreshToken = () => {
	const database = getDatabase();
	return database.get('refresh_token')
}

