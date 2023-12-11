
	const { getAccessToken } = require('./Authentification');
	const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
	const fs = require('fs');
	const uuid = require('uuid');
	const path = require('path');

	module.exports = async function AttachmentDownload(url, id = uuid.v4()) {
		
		const fileExtension = path.extname(url);
		const fileName = id + fileExtension;
		const imagePath = `/applications/holbertonschool-intranet_api/bin/core/attachments/` + fileName;
		const imagePreview = `https://hbtn.hugochilemme.com/api/attachments/${fileName}`

		if (fs.existsSync(imagePath)) {
			return { attachment: imagePreview, name: `${fileName}`};
		}

		const stream = fs.createWriteStream(imagePath);
		
		const OPTIONS = {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${getAccessToken()}`
			}
		}
		const response = await fetch(url, OPTIONS);
		if (response.ok)
		{
			response.body.pipe(stream);
			return { attachment: imagePreview, name: fileName};
		}
		return false;
	}