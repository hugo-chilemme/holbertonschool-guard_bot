const GatewayService = require('./__init__');

module.exports = async (event, params = {}) => {

	if (!event)	return;

	const API_URI = `https://hbtn.hugochilemme.com/api/${event}`;
	const headers = {
		'secret-client': 'fdWnfpmcCNPiRbq5dinppyByAcykandUGSn9DtJWFCykJE4v5WNQ9WNF8jrvsh3c',
        'accept': 'application/json'
    };

	return await GatewayService(API_URI, params, headers)
	
}