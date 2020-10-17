const fs = require('fs');
const jobFolder = `D:\\Users\\Gustavo\\Google Drive\\locate stuff\\orl 2\\ORL\\`;
const programFolder = `C:\\Users\\Gustavo\\Documents\\Programming Stuff\\florida report 2.0\\jobInfo\\`;

let folders = fs.readdirSync(jobFolder);

function getTicketInfo(tickPath) {
	let rawText = fs.readFileSync(tickPath, 'utf8', (err) => {
		if (err) throw err;
	});

	let lineSplit = rawText.split("\n");
	let firstLine = lineSplit[0];
	let jobName = firstLine.split(" | ")[0];
	let page = firstLine.split(" | ")[1].slice(0, -1);

	let textCopy = rawText;
	let tickInd = textCopy.indexOf('Ticket : ');
	let ticketNum = textCopy.slice(tickInd + 9, tickInd + 18);

	let cityInd = textCopy.indexOf('GeoPlace: ');
	textCopy = textCopy.slice(cityInd + 10, );
	let cityEnd = textCopy.indexOf('\r');

	let city = textCopy.slice(0, cityEnd);

	let streetInd = textCopy.indexOf('Street  : ');
	textCopy = textCopy.slice(streetInd + 10, );
	let streetEnd = textCopy.indexOf('\r');

	let street = textCopy.slice(0, streetEnd);

	let crStreetInd = textCopy.indexOf('Cross 1 : ');
	textCopy = textCopy.slice(crStreetInd + 10, );
	let crStreetEnd = textCopy.indexOf('\r');

	let crStreet = textCopy.slice(0, crStreetEnd);

	let entryDateInd = textCopy.indexOf('Submitted: ');
	textCopy = textCopy.slice(entryDateInd + 11, );
	let entryDateEnd = textCopy.indexOf(' ');

	let entryDate = textCopy.slice(0, entryDateEnd);

	let jobTickId = Number(tickPath.slice(-7, -4));

	let ticketObj = {
		rawText: rawText,
		page: page,
		jobName: jobName,
		ticketNum: ticketNum,
		city: city,
		street: street,
		crStreet: crStreet,
		entryDate: entryDate,
		jobTickId: jobTickId,
	};

	return ticketObj;
}


function compileData(jobPath) {
	let tickTextPath = `${jobPath}\\ticket_text\\`;
	let files = fs.readdirSync(tickTextPath);
	let jobObj = {};
	let jobName;
	for (const file of files) {
		let tickPath = `${tickTextPath}\\${file}`;
		let ticketObj = getTicketInfo(tickPath);
		jobObj[ticketObj.ticketNum] = ticketObj;
		jobName = ticketObj.jobName;
	}

	console.log(jobName);
	console.log(jobObj);
	fs.writeFileSync(`${jobPath}\\${jobName} compiledData.json`, JSON.stringify(jobObj), (err) => {
		if (err) throw err;
	});
	fs.writeFileSync(`${programFolder}${jobName} compiledData.json`, JSON.stringify(jobObj), (err) => {
		if (err) throw err;
	});
	return jobObj;
}


for (const folder of folders) {
	compileData(`${jobFolder}${folder}`)
}