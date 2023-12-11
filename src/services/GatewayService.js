const axios = require('axios');

module.exports = async (API_URI, params, headers) => {

	const REQ_START = new Date().getTime();
	console.log(`\x1b[90m→  Event: ${API_URI} (Status: Progress) - Arguments: ${JSON.stringify(params)}\x1b[0m`);

	try {
		const response = await axios.get(API_URI, { params, headers });

		const REQ_STOP = new Date().getTime();
		const totalDuration = REQ_STOP - REQ_START;

		console.log(`\x1b[32m✓  \x1b[90mEvent: ${API_URI} (Status: ${response.status}, Time: ${(totalDuration / 1000).toFixed(2)}s)\x1b[0m`);
		return response.data;
	} catch (e) {
		const REQ_STOP = new Date().getTime();
		console.log(`\x1b[32m✕  \x1b[90mEvent: ${API_URI} (Status: Failed, Time: ${((REQ_STOP - REQ_START) / 1000).toFixed(2)}s)\x1b[0m`);
		console.error(e);
		return null;
	}

}