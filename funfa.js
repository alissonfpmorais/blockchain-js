const express = require('express')
const app = express()
const bodyParser = require('body-parser'); //convert req in json
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');
const cors = require('cors')
const numberOfZeros = '00000'
const nodeAddress = uuid().split('-').join('');

const consensusRequest = {
                uri: "http://localhost:3001/mine"
                method: 'GET',
                json: true
};

rp(consensusRequest).then({
			const requestOptions = {
		    uri: "http://localhost:3002/transaction/broadcast",
		    method: 'POST',
		    body: {
		    	carId: "novatransactionalalala",
		    	password: "123",
		    	meter: 10		
				  },
		    json: true
		};
		rp(requestOptions).then(data => {
			console.log(data);
		});
})




