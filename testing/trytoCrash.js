const rp = require('request-promise');

let newTransaction = {
    "amount": 100,
    "sender": "mazzon",
    "recipient": "matheus"
};

let testingAddTransaction = () => {

    const requestOptions = {
        uri: "http://localhost:3002/transaction/broadcast",
        method: 'POST',
        body: {newTransaction: newTransaction},
        json: true
    };

    rp(requestOptions).then((result) => {
        console.log("testando add transaction");
        console.log(result);
    });
};

let testingGetBlockchain = (callback) => {
    const requestOptions = {
        uri: "http://localhost:3002/blockchain",
        method: 'GET',
        json: true
    };

    rp(requestOptions).then(function (resposta) {
        console.log("testando get blockchain");
        console.log(resposta);
        callback();
    });
};

testingGetBlockchain(testingAddTransaction);






