const sha256 = require("crypto-js/sha256");
const ecLib = require('elliptic').ec; // Ssymmetric elliptic curve cryption
const ec = new ecLib('secp256k1') // Curve name 


// Can compute hash, sign with private key, and check this transaction is valid or not.
class Transaction {
    constructor(from, to, amount) {
        // Single transaction doesn't need timestamp, a block will need timestamp
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    computeHash(){
        return sha256(this.from + this.to + this.amount).toString();
    }

    sign(privateKey){
        // Sign with private key
        this.signature =  privateKey.sign(this.computeHash(), 'base64').toDER('hex')
    }

    isValid(){
        // Check if transaction hash matches public key
        if(this.from === null) // Auto miner reward, no from account
            return true
        if(!this.signature)
            throw new Error("Signature Missing") // No signature

        // Generate public key with this.from address
        const publicKey = ec.keyFromPublic(this.from, 'hex')
        return publicKey.verify(this.computeHash(), this.signature)
    }
}



class Block {
    constructor(transactions, previousHash) {
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.timestamp = Date.now();
        this.nonce = 1; // how many digits equals to their reqierment difficulty
        this.hash = this.computeHash();
    }
  
    computeHash() {
        // Hash of block 
        // Depends on transactions, previous hash, nonce, and tiemtamp
        return sha256(
            JSON.stringify(this.transactions) + this.previousHash + this.nonce + this.timestamp).toString();
    }
  
    getAnswer(difficulty) {
      // A string of [diff] digits equals to 0
      let answer = "";
      for (let i = 0; i < difficulty; i++) {
        answer += "0";
      }
      return answer;
    }

   
    mine(difficulty) {
         // Compute hash value that meets the difficulty requirement
         // Which is so-called "mine"
        if(!this.validateTransactions()){
            throw new Error("Transaction Invalid. Stop Mining.")
        }
        while (true) {
            this.hash = this.computeHash();
            if (this.hash.substring(0, difficulty) !== this.getAnswer(difficulty)) {
                this.nonce ++; // Record the number of computation
                this.hash = this.computeHash(); // Continue computing
            } else {
                break;
            }
        }
        console.log("Finish Mining", this.hash); // Output the hash computed
    }

    
    validateTransactions(){
        //check all transactions in this block is valid
        for(let transaction of this.transactions){
            if(!transaction.isValid()){
                return false
            }
        }
        return true
    }
}



class Chain {
    constructor(difficulty) {
        this.chain = [this.bigBang()]; // Initialize first block(genesis block)
        this.transactionPool = [];
        this.minerReward = 50;
        this.difficulty = difficulty;
    }
  

    setDifficulty(difficulty) {
        // Difficulty changes every 2 weeks by defalut
        this.difficulty = difficulty
    }
  

    bigBang() {
        //Generate genesis block
        const genesisBlock = new Block("Genesis block", "");
        return genesisBlock;
    }
  

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
  

    addTransaction(transaction) {
        // If it has address and it's valid, then add into pool
        console.log(transaction)
        // Not allow to add no address transaction for public
        if(!transaction.from || !transaction.to)
            throw new Error("Invalid from or to.")
        if(!transaction.isValid())
            throw new Error("Invalid transaction, tampered or invalid signature.")
        // Add transactions into pool
        this.transactionPool.push(transaction);
    }

    
    addBlockToChain(newBlock) {
        // Add block to a chain
        // Set previous hash by finding the latest block
        newBlock.previousHash = this.getLatestBlock().hash;
        // newBlock.hash = newBlock.computeHash();
        newBlock.mine(this.difficulty);
        // 这个hash 需要满足一个区块链设置的条件
        this.chain.push(newBlock);
    }


    mineTransactionPool(minerRewardAddress) {
        // Miners reward: a transaction of no from addr, to miner addr, mount is miner reward
        const minerRewardTransaction = new Transaction(null, minerRewardAddress, this.minerReward);
        this.transactionPool.push(minerRewardTransaction); // Add to transaction pool

        // Mine
        const newBlock = new Block(this.transactionPool, this.getLatestBlock().hash);
        newBlock.mine(this.difficulty);

        this.chain.push(newBlock);
        this.transactionPool = []; // Clear transaction pool
    }


    validateChain() {
        // Validate if current block chain
        if (this.chain.length === 1) { 
            // Only one genesis block
            if (this.chain[0].hash !== this.chain[0].computeHash()) {
                return false;
            }
            return true;
        }
        
        for (let i = 1; i <= this.chain.length - 1; i++) {
            // 1. validate transactions
            const blockToValidate = this.chain[i]; // this.chain[1] is the actual first block
            if (!blockToValidate.validateTransactions()){
                console.log("Invalid Transaction.")
                return false
            }
            // 2. validate data integrity by checking block hash
            if (blockToValidate.hash !== blockToValidate.computeHash()) {
                console.log("Tampered Data.");
                return false;
            }
            // 3. validate previousHash of current block = hash of previous block
            const previousBlock = this.chain[i - 1];
            if (blockToValidate.previousHash !== previousBlock.hash) {
                console.log("Broken Links.");
                return false;
            }
        }
        return true;
    }
}

module.exports = { Chain, Transaction, Block }
