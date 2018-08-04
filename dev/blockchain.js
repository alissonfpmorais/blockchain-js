const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');
const fs = require('fs')
const writter = fs.createWriteStream('chain.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
});

var alreadyBlockMined = false;
const zerosString = '000000';
const numberOfZeros = zerosString.length;

function Blockchain() {
	this.chain = [];

	this.pendingTransactions = [];
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

	var contents = fs.readFileSync('chain.txt', 'utf8').split('\n');

	if(contents == ""){
		this.createNewBlock(100, '0', '0',[]);
	} else{
		contents.forEach(blockString => {
			if(blockString != ""){
				var obj = JSON.parse(blockString);
				this.addBlock(obj);
			}
		});
	}
}

Blockchain.prototype.addBlock = function(block) {
	this.chain.push(block);
}

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash, pendingTransactionsMined) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: pendingTransactionsMined,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

	this.removeMinedTransactions(pendingTransactionsMined);
	if( writter != null){
        writter.write(JSON.stringify(newBlock) + '\r\n') //
    }
    this.chain.push(newBlock);

    return newBlock;
};

Blockchain.prototype.removeMinedTransactions = function (pendingTransactionsMined) {
	this.pendingTransactions.splice(0,pendingTransactionsMined.length);
};

Blockchain.prototype.getLastBlock = function () {
	return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = (meter, carId, password) => {
	const newTransaction = {
		meter: meter,
		carId: carId,
		password: password,
		transactionId: uuid().split('-').join('')
	};
	return newTransaction;
};

Blockchain.prototype.createNewTransactionMoney = function (amount, sender, recipient) {
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionId: uuid().split('-').join('')

	};
	return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function (transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock['index'] + 1;
};

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData){
	console.log('comecando a minerar');
	alreadyBlockMined = false;
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, numberOfZeros) !== zerosString) {
		if(alreadyBlockMined){
			console.log('Outro bloco ja mineirou');
			return -1;
		}
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}

	return nonce;
};

Blockchain.prototype.chainIsValid = function (blockchain) {
	let validChain = true;
	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], {
			transactions: currentBlock['transactions'],
			index: currentBlock['index']
		}, currentBlock['nonce']);
		if (blockHash.substring(0, numberOfZeros) !== zerosString) validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) {
            //chain not valid
            validChain = false;
            break;
        }
    }
    ;

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;

    if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
    	validChain = false;
    }

    return validChain;
};

Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if(block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			};
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};

Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			};
		});
	});
	let balance = 0;
	addressTransactions.forEach(transaction => {
		if(transaction.recipient === address){
			balance += transaction.amount;
		} else {
			balance -= transaction.amount;
		}
	});
	return {
		addressTransactions:addressTransactions,
		addressBalance: balance
	};
};

Blockchain.prototype.getDataByCarId = function(carId) {
	const meterByDay = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.carId === carId) {
				meterByDay.push(transaction);
			};
		});
	});
	let odometer = 0;
	meterByDay.forEach(transaction => {
		odometer += transaction.meter;
	});
	return {
		meterByDay: meterByDay,
		odometer: odometer
	};
};


Blockchain.prototype.isPasswordValid = function(carId,password) {
	var passwordValid = true;
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.carId === carId) {
				if(transaction.password != password){
					passwordValid = false;
				}
			};
		});
	});
    //se nao achou, tenta procurar nas transaçoes pendentes
    if(passwordValid) {
    	this.pendingTransactions.forEach(transaction => {
    		if(transaction.carId === carId) {
    			if(transaction.password != password){
    				passwordValid = false;
    			}
    		};
    	});
    };
    return passwordValid;
};
Blockchain.prototype.setAlreadyBlockMined = function () {
	alreadyBlockMined = true;
};

module.exports = Blockchain;