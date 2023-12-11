const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const GatewayService = require('./GatewayService');

const { getAccessToken, getRefreshToken} = require('./libraries/slack/Authentification');

function mergeUrl(url, params) {
	return url + "?" + new URLSearchParams(params).toString();
}

async function sendApi(event, params = {}) {
	const API_URI = `https://slack.com/api/${event}`;
	const REQ_START = new Date().getTime();
	const headers = {
		'Authorization': `Bearer ${getAccessToken()}`
	}
	return await GatewayService(API_URI, params, headers);	  
}



module.exports = sendApi;