const GatewayService = require('./GatewayService');
const { HOLBERTON_TOKEN } = require('../config');

module.exports = async (event, params = {}) => {

	if (!event)	return;

	const API_URI = `https://hbtn.hugochilemme.com/api/${event}`;
	const headers = {
		'secret-client': HOLBERTON_TOKEN,
        'accept': 'application/json'
    };

	return await GatewayService(API_URI, params, headers)

}