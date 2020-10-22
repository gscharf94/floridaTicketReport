const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = "https://exactix.sunshine811.com/findTicketByNumberAndPhone";
const PHONE = "5612899035"

const jobInfo = `C:\\Users\\Gustavo\\Documents\\Programming Stuff\\florida report 2.0\\jobInfo\\`;
const reportInfo = `C:\\Users\\Gustavo\\Documents\\Programming Stuff\\florida report 2.0\\locateReport\\`;

function createTripleSplit() {
	let fileNames = fs.readdirSync(jobInfo, 'utf8', (err) => {
		if (err) throw err;
	});
	let allTicks = {};
	for (file of fileNames) {
		let filePath = `${jobInfo}${file}`;
		let ticks = getTicks(filePath);
		for (const tick in ticks) {
			allTicks[tick] = ticks[tick];
		}
	}
	let p1 = {};
	let p2 = {};
	let p3 = {};

	let i = 1;
	for (const tick in allTicks) {
		if (i == 1) {
			p1[tick] = allTicks[tick];
			i++;
		} else if (i == 2) {
			p2[tick] = allTicks[tick];
			i++;
		} else {
			p3[tick] = allTicks[tick];
			i = 1;
		}
	}

	return [p1, p2, p3];
}

function getTicks(filePath) {
	let rawText = fs.readFileSync(filePath, 'utf8', (err) => {
		if (err) throw err;
	});
	return JSON.parse(rawText);
}

function randomDelay() {
	return Math.round((Math.random() * 2500));
}

class Browser {
	constructor(tickets, part) {
		this.tickets = tickets;
		this.part = part;
		this.main();
	}

	async waitForLoad(page) {
		console.log('waiting for page to load..');
		await page.waitForNavigation({
			waitUntil: 'domcontentloaded',
		});
		console.log('loaded');
	}

	async openSearchPage(page) {
		await page.goto(URL);
		await page.evaluate(num => {
			let button = document.querySelector('button.mat-button');
			button.disabled = false;
		}, PHONE);
		let phoneBar = await page.$$("input");
		await phoneBar[1].type(PHONE);
	}

	async getResponses(page, ticket) {
		let ticketBar = await page.$('input[id="mat-input-0"]');

		await ticketBar.click({
			clickCount: 3,
			delay: randomDelay(),
		});
		await ticketBar.type(ticket);

		let findButton = await page.$('button.mat-button');
		await findButton.click();

		let test = await page.evaluate(() => document.querySelector('.iq-list-items'));
		while (test == null) {
			console.log('repeat');
			test = await page.evaluate(() => document.querySelector('.iq-list-items'));
		}

		let responseTable = await page.evaluate(() => {
			let ret = [];
			let rows = document.querySelectorAll('.iq-list-item');
			// console.clear();
			// console.log('rows found');
			// console.log(rows);
			let c = 0;
			for (const row of rows) {
				let cells = row.querySelectorAll('div.column-fixed');
				let tmpRow;
				// console.log(`row: ${c}`);
				console.log(cells);
				console.log(cells[0]);
				if (cells[0].textContent == " Yes ") {
					// console.log(`row ${c} SEC 1`)
					tmpRow = [cells[1].textContent, cells[2].textContent, cells[6].textContent];
				} else if (cells[0].textContent == " No ") {
					// console.log(`row ${c} SEC 2`)
					tmpRow = [cells[1].textContent, cells[2].textContent, cells[6].textContent];
				} else {
					// console.log(`row ${c} SEC 3`)
					tmpRow = [cells[0].textContent, cells[1].textContent, cells[5].textContent];
				}
				c++;
				ret.push(tmpRow);
			}
			return ret;
		});

		return responseTable;
	}

	writeToFile() {
		let json = JSON.stringify(this.tickets);
		fs.writeFileSync(`${reportInfo}${this.part}.json`, json);
	}


	main() {
		(async () => {
			const browser = await puppeteer.launch({
				headless: false,
				slowMo: 150,
			});
			const page = await browser.newPage();
			await this.openSearchPage(page);

			for (const ticket in this.tickets) {
				let responses = await this.getResponses(page, ticket);
				this.tickets[ticket].responses = responses;
			}

			this.writeToFile();

			setTimeout(async () => {
				browser.close();
			}, 10000);
		})();
	}
}



let [p1, p2, p3] = createTripleSplit();


let b1 = new Browser(p1, 1);
let b2 = new Browser(p2, 2);
let b3 = new Browser(p3, 3);