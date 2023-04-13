const ecLib = require('elliptic').ec; // asymmetric elliptic curve cryption
const ec = new ecLib('secp256k1') // curve name
const { Transaction, Chain, Block } = require("./blockChainDemo");

// Create a crypto currency named yingCoin, with difficulty 3
const yingCoin = new Chain(3);
// Sender's keys
const keyPairSender = ec.genKeyPair();
const privateKeySender = keyPairSender.getPrivate('hex')
const publicKeySender = keyPairSender.getPublic('hex')
// Receiver's keys
const keyPairReceiver = ec.genKeyPair();
const privateKeyReceiver = keyPairReceiver.getPrivate('hex')
const publicKeyReceiver = keyPairReceiver.getPublic('hex')

// 1st transaction: Sender -> 10 -> Recervier
const t1 = new Transaction(publicKeySender, publicKeyReceiver, 10);
t1.sign(ec.keyFromPrivate(privateKeySender))
console.log(t1)
yingCoin.addTransaction(t1);
// t1.amount=20 // If want to change amout, can test tempered data, next line output will be false
console.log(yingCoin.validateChain()) // True

// const t2 = new Transaction("addr2", "addr1", 5); 
// yingCoin.addTransaction(t2); // 2nd transaction added
// console.log(yingCoin) // Chain {chain: Array(1), transactionPool: Array(1), minerReward: 50, difficulty: 3}

yingCoin.mineTransactionPool("addr3"); // 3rd no address transaction added
console.log(yingCoin.validateChain()) //true
console.log(yingCoin) // Chain {chain: Array(2), transactionPool: Array(0), minerReward: 50, difficulty: 3}
console.log(yingCoin.chain[1])