const fs = require('fs');
const readline = require('readline');
const {
	google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Google Drive API.
	authorize(JSON.parse(content), uploadFile);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	const {
		client_secret,
		client_id,
		redirect_uris
	} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
	const drive = google.drive({
		version: 'v3',
		auth
	});
	drive.files.list({
		pageSize: 10,
		fields: 'nextPageToken, files(id, name)',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const files = res.data.files;
		if (files.length) {
			console.log('Files:');
			files.map((file) => {
				console.log(`${file.name} (${file.id})`);
			});
		} else {
			console.log('No files found.');
		}
	});
}

const responsePath = "C:\\Users\\Gustavo\\Documents\\Programming Stuff\\florida report 2.0\\locateReport\\";
const programPath = "C:\\Users\\Gustavo\\Documents\\Programming Stuff\\florida report 2.0\\";

let fp1 = `${responsePath}1.json`;
let fp2 = `${responsePath}2.json`;
let fp3 = `${responsePath}3.json`;

let rt1 = fs.readFileSync(fp1, 'utf8', (err) => {
	if (err) throw err;
});
let rt2 = fs.readFileSync(fp2, 'utf8', (err) => {
	if (err) throw err;
});
let rt3 = fs.readFileSync(fp3, 'utf8', (err) => {
	if (err) throw err;
});

let obj1 = JSON.parse(rt1);
let obj2 = JSON.parse(rt2);
let obj3 = JSON.parse(rt3);

let finalObj = {};

let objs = [obj1, obj2, obj3];

for (const obj of objs) {
	for (const ticket in obj) {
		if (finalObj[obj[ticket].jobName] == undefined) {
			finalObj[obj[ticket].jobName] = {};
			finalObj[obj[ticket].jobName][ticket] = obj[ticket];
		} else {
			finalObj[obj[ticket].jobName][ticket] = obj[ticket];
		}
	}
}

const oldUploadsPath = "C:\\Users\\Gustavo\\Documents\\Programming Stuff\\florida report 2.0\\oldUploads\\";

let today = new Date();
let dateStr = `${today.getMonth()+1}-${today.getDate()}`;

fs.writeFileSync(`${programPath}responses.json`, JSON.stringify(finalObj));
fs.writeFileSync(`${oldUploadsPath}${dateStr} responses.json`, JSON.stringify(finalObj));

function uploadFile(auth) {
	const drive = google.drive({
		version: 'v3',
		auth,
	});
	const fileMetaData = {
		'name': 'responses.json',
		parents: ['1SKXsnWgfGUptiRTGegAxmBz4RNHkVAeX'],
	};
	const media = {
		mimeType: 'text/plain',
		body: fs.createReadStream('responses.json'),
	};
	drive.files.create({
		resource: fileMetaData,
		media: media,
		fields: 'id',
	}, (err, file) => {
		if (err) {
			console.error(err);
		} else {
			console.log(`file id: ${file.id}`);
		}
	});
}