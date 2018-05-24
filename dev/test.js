const Blockchain = require('./blockchain')

const bitcoin = new Blockchain()
bitcoin.createNewTransaction(56.60, 'mazzon', 'matheus')
bitcoin.createNewBlock(2389, '1M23K1J09F1N', 'L1239098F0912')

console.log(bitcoin)
console.log(bitcoin.chain[0].transactions)