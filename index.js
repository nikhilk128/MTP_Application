const express = require('express');
const app = express();
const url = require('url');
const urlEncoderParser = express.urlencoded({extended : true});

app.set('view engine', 'pug');
app.set('views', './views');






'use strict';
const fs = require('fs');
const md5 = require('md5'); //npm install md5
require('log-timestamp');  //npm install log-timestamp
var globarr = [];
const readLastLines = require('read-last-lines');
const { promisify } = require('util')
const fsreadFile = promisify(fs.readFile)

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

const buttonPressesLogFile = '/var/log/apache2/access.log'; //Add path of apachelog
const writeTime = 5000;

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {
		const ccp = buildCCPOrg1();

		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		const wallet = await buildWallet(Wallets, walletPath);

		await enrollAdmin(caClient, wallet, mspOrg1);

		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);



			console.log(`Watching for file changes on ${buttonPressesLogFile}`);
			let md5Previous = null;
			let fsWait = false;
			let towait = false;
			fs.watch(buttonPressesLogFile, async (event, filename) => {
			if (filename) {
				if (fsWait) return;
				fsWait = setTimeout(() => {
				fsWait = false;
				}, 100);
				const md5Current = md5(fs.readFileSync(buttonPressesLogFile));
				if (md5Current === md5Previous) {
				return;
				}
				md5Previous = md5Current;
				fsreadFile(buttonPressesLogFile, 'utf-8', (err, data) => {
				if (err) throw err;
				let lines = data.trim().split("\n");
				let line = lines[lines.length - 1];
				var regexp = /^(\S+) \S+ \S+ \[([^\]]+)\] "([A-Z]+)([^"]*)" \d+ \d+ "[^"]*" "([^"]*)"$/m
				if(regexp.test(line)){
					var result = line.match(regexp);
					
					var logDict = {
						ipAddr : result[1],
						timestamp : result[2],
						httpMethod : result[3],
						path : result[4]
					};
					globarr.push(logDict);
					if(towait) return;
					towait = setTimeout(async () => {
						towait = false;
						console.log(`\n--> Submitting ${globarr.length} Transactions : WriteLog`);
						for(var index = 0; index < globarr.length; index++){
							let result = await contract.submitTransaction('WriteLog', globarr[index].ipAddr, globarr[index].timestamp, globarr[index].httpMethod, globarr[index].path);
							if (`${result}` !== '') {
								console.log(`*** Result: ${prettyJSONString(result.toString())}`);
							}
						}
						console.log('*** Result: committed');
						globarr.length = 0;
					}, writeTime);
				}
				else{
				console.log('Not identified');
				}
			});
				console.log(`${buttonPressesLogFile} file Changed`);
			}
			});
			app.use(express.json());


		app.get('/', function (req, res) {
			var data = req.query.query;
			res.render('form');
		});

		app.post('/query2', urlEncoderParser, async function (req, res) {
			// var data = req.body.text;
			var curr = req.body.q2tfN;
			console.log(curr);
			result = await contract.evaluateTransaction('QueryLogByIP', '123');
			console.log(result.toString());

			res.send(prettyJSONString(result.toString()));
		});

		app.post('/query1', urlEncoderParser, function (req, res) {
			// var data = req.body.text;
			console.log(`${req.body.q1tfN} is here`);
			res.send({ msg: `${req.body.q1tfN} is here` });
		});

		app.listen(8000);
// Mycode
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}


	
}

main();
