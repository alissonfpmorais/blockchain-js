const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const bc1 = {
"chain": [
{
"index": 1,
"timestamp": 1532033432860,
"transactions": [],
"nonce": 100,
"hash": "0",
"previousBlockHash": "0"
},
{
"index": 2,
"timestamp": 1532033493440,
"transactions": [],
"nonce": 18140,
"hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
"previousBlockHash": "0"
},
{
"index": 3,
"timestamp": 1532033604623,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "610055c08b9511e8b8503fa89730db7b",
"transactionId": "852013a08b9511e8b8503fa89730db7b"
},
{
"amount": 300,
"sender": "José",
"recipient": "Amanda",
"transactionId": "b5d7d9108b9511e8b8503fa89730db7b"
},
{
"amount": 20,
"sender": "José",
"recipient": "Amanda",
"transactionId": "bd1b21a08b9511e8b8503fa89730db7b"
},
{
"amount": 30,
"sender": "José",
"recipient": "Amanda",
"transactionId": "bf4617f08b9511e8b8503fa89730db7b"
}
],
"nonce": 35438,
"hash": "0000e4736189b5a8ad61b255f9a662208d2229fc5ec9f22f4ce1aadc9e19a815",
"previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
},
{
"index": 4,
"timestamp": 1532033663677,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "610055c08b9511e8b8503fa89730db7b",
"transactionId": "c761bf208b9511e8b8503fa89730db7b"
},
{
"amount": 40,
"sender": "José",
"recipient": "Amanda",
"transactionId": "d334c9008b9511e8b8503fa89730db7b"
},
{
"amount": 50,
"sender": "José",
"recipient": "Amanda",
"transactionId": "d545ceb08b9511e8b8503fa89730db7b"
},
{
"amount": 60,
"sender": "José",
"recipient": "Amanda",
"transactionId": "d74484e08b9511e8b8503fa89730db7b"
},
{
"amount": 70,
"sender": "José",
"recipient": "Amanda",
"transactionId": "d91bb5e08b9511e8b8503fa89730db7b"
}
],
"nonce": 207342,
"hash": "00006af9a6cc0345b088d780bcf77cc3bffffe639b5f4cec434aeaf60a3ef99a",
"previousBlockHash": "0000e4736189b5a8ad61b255f9a662208d2229fc5ec9f22f4ce1aadc9e19a815"
},
{
"index": 5,
"timestamp": 1532033679237,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "610055c08b9511e8b8503fa89730db7b",
"transactionId": "ea9632a08b9511e8b8503fa89730db7b"
}
],
"nonce": 37710,
"hash": "0000a06042ed1cf1bf9fc1a97f23d641235887a10f3caf53b1a6a988f041a2a2",
"previousBlockHash": "00006af9a6cc0345b088d780bcf77cc3bffffe639b5f4cec434aeaf60a3ef99a"
},
{
"index": 6,
"timestamp": 1532033679937,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "610055c08b9511e8b8503fa89730db7b",
"transactionId": "f3daf0808b9511e8b8503fa89730db7b"
}
],
"nonce": 6748,
"hash": "0000cf2049860c104318101c45ac712bb52fc7c772950c72eed93d18f2de5562",
"previousBlockHash": "0000a06042ed1cf1bf9fc1a97f23d641235887a10f3caf53b1a6a988f041a2a2"
}
],
"pendingTransactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "6100055c00008b9511e8b8503fa89730db7b",
"transactionId": "f44599308b9511e8b8503fa89730db7b"
}
],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
};

console.log('Valid: ' ,bitcoin.chainIsValid(bc1.chain));
