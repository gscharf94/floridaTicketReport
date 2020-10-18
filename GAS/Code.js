const jobFolderId = "1SKXsnWgfGUptiRTGegAxmBz4RNHkVAeX";
const jobIdToName = {
	1: '210_FDOT-4',
	2: 'FREEDOMCOMMANDER_FDOT-3',
	3: 'LAKECONWAY_FDOT-7',
	4: 'SAMSGAS_ORANGE CO-3',
	5: 'SAMSGAS_ORANGE CO-5',
	6: 'SAMSGAS_ORANGE CO-6',
	7: 'SAMSGAS_ORANGE CO-7',
	8: 'SAMSGAS_ORANGE CO-9',
	9: 'SAMSGAS_ORANGE CO-10',
	10: 'SAMSGAS_ORANGE CO-11',
	11: 'SAMSGAS_ORANGE CO-14',
	12: 'SAMSGAS_ORANGE CO-15',
	13: 'SAMSGAS_ORANGE CO-18',
	14: 'SAMSGAS_ORANGE CO-19',
	15: 'WALMART5871_FDOT-2',
}
const jobNameToId = {
	'210_FDOT-4': 1,
	'FREEDOMCOMMANDER_FDOT-3': 2,
	'LAKECONWAY_FDOT-7': 3,
	'SAMSGAS_ORANGE CO-3': 4,
	'SAMSGAS_ORANGE CO-5': 5,
	'SAMSGAS_ORANGE CO-6': 6,
	'SAMSGAS_ORANGE CO-7': 7,
	'SAMSGAS_ORANGE CO-9': 8,
	'SAMSGAS_ORANGE CO-10': 9,
	'SAMSGAS_ORANGE CO-11': 10,
	'SAMSGAS_ORANGE CO-14': 11,
	'SAMSGAS_ORANGE CO-15': 12,
	'SAMSGAS_ORANGE CO-18': 13,
	'SAMSGAS_ORANGE CO-19': 14,
	'WALMART5871_FDOT-2': 15,
}


function doGet() {
	return HtmlService
		.createTemplateFromFile('index')
		.evaluate();
}

function include(filename) {
	return HtmlService
		.createHtmlOutputFromFile(filename)
		.getContent();
}

function generateMainHtml() {
	let jobFolder = DriveApp.getFolderById(jobFolderId);
	let responsesFile = jobFolder.getFilesByName('responses.json').next();
	let ticketData = JSON.parse(responsesFile.getBlob().getDataAsString());

	for (const job in ticketData) {
		let [textIds, picIds] = getTextPicFolderIds(job, jobFolder);
		ticketData[job].textIds = textIds;
		ticketData[job].picIds = picIds;
	}

	let output = ``;
	for (const job in ticketData) {
		let jobHtml = createJobCollapseable(ticketData[job], job);
		output += jobHtml;
	}

	return [output, JSON.stringify(ticketData)];
}

function createJobCollapseable(jobData, jobName) {
	let jobId = jobNameToId[jobName]
	let html = `<button type="button" class="jobButton" onclick="toggleJob('${jobId}')">${jobName}</button>`;
	html += `<div class="jobContent" id="jobInfo${jobId}">`;

	html += `<ul class="tickList">`;
	for (const ticket in jobData) {
		if (ticket == "textIds" || ticket == "picIds") {
			continue;
		}
		let tickData = jobData[ticket];
		html += `<li><button class="ticketButton" onclick="expandTicket('${jobId}','${ticket}')">${ticket} Exp: ${getExpirationDate(tickData.entryDate)} - ${tickData.street}, ${tickData.crStreet} - ${tickData.page}</button></li>`;
		html += `<div class="ticketContent" id="${ticket}Content"><img class="ticketImage" id="${ticket}Image"><p class="ticketText" id="${ticket}Text"></p><div class="responseTable" id="${ticket}Table"></div></div>`;
	}
	html += `</ul>`;
	html += `</div><br>`;

	return html;
}

function getTextPicFolderIds(jobName, mainFolder) {
	let jobFolder = mainFolder.getFoldersByName(jobName).next();
	``

	let textFolder = jobFolder.getFoldersByName('ticket_text').next();
	let textFiles = textFolder.getFiles();

	let textIds = {};

	while (textFiles.hasNext()) {
		let file = textFiles.next();
		textIds[Number(file.getName().slice(0, 3))] = file.getId();
	}

	let picFolder = jobFolder.getFoldersByName('ticket_pics').next();
	let picFiles = picFolder.getFiles();

	let picIds = {};

	while (picFiles.hasNext()) {
		let file = picFiles.next();
		picIds[Number(file.getName().slice(0, 3))] = file.getId();
	}

	return [textIds, picIds];
}

function getExpirationDate(date) {
	let dateObj = new Date(date);
	dateObj.setDate(dateObj.getDate() + 30);
	return `${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
}

function generateResponseTable(tick) {
	let responseArr = tick.responses;
	let ticketNum = tick.ticketNum;

	let html = `<table id="${ticketNum}Table">`;
	html += `<tr><th>Utility</th><th>Type</th><th>Response</th></tr>`;
	for (const row of responseArr) {
		let defaultReady = "notReady";
		let response = row[2];
		if (response[0] == '2' || response.indexOf("No Conflict") != -1) {
			defaultReady = "ready";
		}
		let htmlRow = `<tr class="${defaultReady}">`;
		for (const item of row) {
			htmlRow += `<td>${item}</td>`;
		}
		htmlRow += `</tr>`
		html += htmlRow;
	}
	html += `</table>`;
	return html;
}

function loadImage(ticket, job, ticketInfo) {
	ticketInfo = JSON.parse(ticketInfo);
	let jobName = jobIdToName[job];

	let ticketObj = ticketInfo[jobName][ticket];

	let picId = ticketInfo[jobName]['picIds'][ticketObj.jobTickId];
	let textId = ticketInfo[jobName]['textIds'][ticketObj.jobTickId];
	let imageBytes = DriveApp.getFileById(picId).getBlob().getBytes();
	let ticketText = DriveApp.getFileById(textId).getBlob().getDataAsString();

	let tableHtml = generateResponseTable(ticketInfo[jobName][ticket]);

	console.log(ticket);
	console.log(ticketText);

	return [Utilities.base64Encode(imageBytes), ticket, ticketText, tableHtml];
}