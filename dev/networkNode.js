const express = require('express')
const app = express()
const bodyParser = require('body-parser'); //convert req in json
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');
const cors = require('cors')
const zerosString = '000000';
const numberOfZeros = zerosString.length;
const nodeAddress = uuid().split('-').join('');

const carChain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())


app.get('/blockchain', function (req, res) {
	res.send(carChain);
});


app.post('/transaction', function (req, res) {
	const newTransaction = req.body.newTransaction;
	const blockIndex = carChain.addTransactionToPendingTransactions(newTransaction);
	res.json({note: `Transaction will be added in block ${blockIndex}.`});
});

app.post('/transactionMoney/broadcast', function (req, res) {
	const newTransaction = carChain.createNewTransactionMoney(req.body.amount, req.body.sender, req.body.recipient);
	carChain.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	carChain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + "/transaction",
			method: 'POST',
			body: {newTransaction: newTransaction},
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({note: 'Transaction created and broadcast successfully'});
	});
});

app.post('/transaction/broadcast', (req, res) => {
	const password = req.body.password;
	const carId = req.body.carId;
	if(!carChain.isPasswordValid(carId, password)){
		res.json({ note: 'Password incorrect' });
	} else {
		const newTransaction = carChain.createNewTransaction(req.body.meter, req.body.carId, password);
		carChain.addTransactionToPendingTransactions(newTransaction);

		const requestPromises = [];
		carChain.networkNodes.forEach(networkNodeUrl =>{
			const requestOptions = {
				uri: networkNodeUrl + "/transaction",
				method: 'POST',
				body: { newTransaction: newTransaction},
				json: true
			};

			requestPromises.push(rp(requestOptions));
		});

		Promise.all(requestPromises)
		.then(data => {
			res.json({ note: 'Transaction created and broadcast successfully' });
		});
	}
});

app.get('/mine', function (req, res) {
	console.log("mine chamado");
	const lastBlock = carChain.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
        transactions: carChain.pendingTransactions.slice(),//passando por copia
        index: lastBlock['index'] + 1
    };
    const nonce = carChain.proofOfWork(previousBlockHash, currentBlockData);
    if(nonce == -1) {
    	const requestOptions = {
    		uri: carChain.currentNodeUrl + '/consensus',
    		method: 'GET',
    		json: true
    	}
    	console.log('Chamando consensus pq outro no minerou primeiro');
    	rp(requestOptions);
    }
    else {
    	const blockHash = carChain.hashBlock(previousBlockHash, currentBlockData, nonce);
    	const newBlock = carChain.createNewBlock(nonce, previousBlockHash, blockHash, currentBlockData['transactions']);

    	const requestPromises = [];
    	carChain.networkNodes.forEach(networkNodeUrl => {
    		const requestOptions = {
    			uri: networkNodeUrl + "/receive-new-block",
    			method: "POST",
    			body: {newBlock: newBlock},
    			json: true
    		};
    		requestPromises.push(rp(requestOptions));
    	});
    	Promise.all(requestPromises)
    	.then(data => {
    		const requestOptions = {
    			uri: carChain.currentNodeUrl + '/transactionMoney/broadcast',
    			method: "POST",
    			body: {
    				amount: 12.5,
    				sender: "00",
    				recipient: nodeAddress
    			},
    			json: true
    		};
    		return rp(requestOptions);
    	})
    	.then(data => {
    		res.json({
    			note: "New block mined & broadcast successfully",
    			block: newBlock
    		});
    	});
    }
});

app.post("/receive-new-block", function (req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = carChain.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	const blockHash = carChain.hashBlock(lastBlock['hash'], {
		transactions: newBlock['transactions'],
		index: newBlock['index']
	}, newBlock['nonce']);
	const correctNonce = blockHash.substring(0, numberOfZeros) === zerosString;

	if (correctIndex && correctHash && correctNonce){
		console.log('setando already block mined');
		carChain.setAlreadyBlockMined();
		carChain.chain.push(newBlock);
		carChain.removeMinedTransactions(newBlock['transactions']);
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		console.log('bloco rejeitado');
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}

});

// register a node and broadcast it the network, adiciona o nó e chama register node para todos os nós da rede,
// fazendo com que todos os nós adicionem o novo nó. Depois disso, adiciona todos os nós para o novo nó inserido, através do register-nodes-bulk
app.post('/register-and-broadcast-node', function (req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (carChain.networkNodes.indexOf(newNodeUrl) == -1)
		carChain.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	carChain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: {newNodeUrl: newNodeUrl},
			json: true
		};

		regNodesPromises.push(rp(requestOptions));

	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + "/register-nodes-bulk",
			method: 'POST',
			body: {allNetworkNodes: [...carChain.networkNodes, carChain.currentNodeUrl]},
			json: true
		};
		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({node: 'New node registred with network successfully.'});
	})

});

// register a node with the network
app.post('/register-node', function (req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = carChain.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = carChain.currentNodeUrl != newNodeUrl;

	if (nodeNotAlreadyPresent && notCurrentNode)
		carChain.networkNodes.push(newNodeUrl);
	res.json({node: 'New node registered successfully.'});
});

//chamado após o nó ser inserido na rede, para que o novo no tenha todos os nós da rede
app.post('/register-nodes-bulk', function (req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = carChain.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = carChain.currentNodeUrl != networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode)
			carChain.networkNodes.push(networkNodeUrl);
	});
	const consensusRequest = {
		uri: carChain.currentNodeUrl + "/consensus",
		method: 'GET',
		json: true
	};
	rp(consensusRequest);

	res.json({note: 'Bulk registration successfully.'});
});

app.get('/consensus', function (req, res) {
	const requestPromises = [];
	carChain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};
		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = carChain.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			}
		});

		if (!newLongestChain || (newLongestChain && !carChain.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced',
				chain: carChain.chain
			});
		} else if (newLongestChain && carChain.chainIsValid(newLongestChain)) {
			carChain.chain = newLongestChain;
			carChain.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced',
				chain: carChain.chain
			});
		}
	});
});

app.get('/block/:blockHash', (req, res) => { //localhost:3001/block/asdowidonaioda
	const blockHash = req.params.blockHash;
	const correctBlock = carChain.getBlock(blockHash);
	res.json({
		block: correctBlock
	});
});

app.get('/transaction/:transactionId', (req, res) => {
	const transactionId = req.params.transactionId;
	const transactionData = carChain.getTransaction(transactionId);
	res.json({
		transaction: transactionData.transaction,
		block: transactionData.block
	});
});

app.get('/address/:address', (req, res) => {
	const address = req.params.address;
	const addressData = carChain.getAddressData(address);
	res.json({
		addressData: addressData
	});
});

app.get('/carId/:carId', (req, res) => {
	const carId = req.params.carId;
	const carIdData = carChain.getDataByCarId(carId);
	res.json({
		carIdData: carIdData
	});
});


app.get('/block-explorer', (req, res) => {
	res.sendFile('./block-explorer/index.html', {root: __dirname});
});

app.get('/mineAll', (req,res) => {
	console.log('mineAll');
	const requestPromises = [];
	carChain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/mine',
			method: 'GET',
			json: true
		};
		requestPromises.push(rp(requestOptions));
	});
	const requestOptions = {
		uri: carChain.currentNodeUrl + '/mine',
		method: 'GET',
		json: true
	};
	requestPromises.push(rp(requestOptions));
	Promise.all(requestPromises)
	.then(data => {
		res.json({node: 'Mineirado com sucesso'});
	})
});

function verify(){
	const requests = [];
	const nodesOk = [];
	carChain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/nodeOn',
			method: 'POST',
			json: true
		};
		requests.push(rp(requestOptions)
			.then(response => {
				const url = response.url;
				nodesOk.push(url);
			})
			.catch(err => {
				console.log('erro')
			}));
	});
	Promise.all(requests)
	.then(() => {
		carChain.networkNodes = nodesOk;
		console.log(nodesOk);
	})
}

app.post('/nodeOn', (req,res) => {
	res.json({url: carChain.currentNodeUrl})
});

app.listen(port, function () {
	console.log(`Listening on port ${port}...`);
});