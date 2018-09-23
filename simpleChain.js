/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
let levelSandbox = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data) {
		this.hash = "",
			this.height = 0,
			this.body = data,
			this.time = 0,
			this.previousBlockHash = ""
	}
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain
{
	constructor() 
	{
			
		this.checkIfGenesisBlockExists();
	}

	// Check If Genesis Block exists, if so, don't add it
	async checkIfGenesisBlockExists()
	{
		let blockHeight = await this.getBlockHeight();	
		if(blockHeight === 0)
		{
			this.addBlock(new Block("First block in the chain - Genesis block"));
		}	
	}

	// Add new block
	async addBlock(newBlock) {
		// Block height
		let blockHeight = await this.getBlockHeight();

		// UTC timestamp
		newBlock.time = new Date().getTime().toString().slice(0, -3);

		// previous block hash
		if (blockHeight > 0) {
			newBlock.height = blockHeight;

			const block = await this.getBlock(blockHeight - 1);

			newBlock.previousBlockHash = JSON.parse(block).hash;
		} else {
			newBlock.height = 0;
		}

		// Block hash with SHA256 using newBlock and converting to a string
		newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

		// Adding block object to chain
		levelSandbox.addLevelDBData(blockHeight, JSON.stringify(newBlock));		
	}

		// get block
	async getBlock(blockHeight) {
		let block = await levelSandbox.getLevelDBData(blockHeight);
		return block;
	}

	// Get block height
	async getBlockHeight() {
		let blockHeight = await levelSandbox.getBlockHeight();
		return blockHeight;
	}

	// validate block
	async  validateBlock(blockHeight) {
		// get block object
		let block = await this.getBlock(blockHeight);

		block = JSON.parse(block);

		// get block hash
		let blockHash = block.hash;

		// remove block hash to test block integrity
		block.hash = '';

		// generate block hash
		let validBlockHash = SHA256(JSON.stringify(block)).toString();

		// Compare	
		if (blockHash === validBlockHash) {
			return true;
		} else {
				console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
			return false;
		}
	}

	// Validate blockchain
	async validateChain() {
		let errorLog = [];

		// get block height
		let blockHeight = await this.getBlockHeight();

		for (var i = 0; i < blockHeight; i++) 
		{
			if(i === 0)
			{
				validateBlock(i);
			}
			else if (i > 0) {
				// get block object
				let block = await this.getBlock(i);
				block = JSON.parse(block);

				// get  next block object
				let previousBlock = await this.getBlock(i - 1);
				previousBlock = JSON.parse(previousBlock);

				// validate block
				if (!this.validateBlock(i)) errorLog.push(i);

				// compare blocks hash link
				let blockHash = previousBlock.hash;
				let previousHash = block.previousBlockHash;

				if (blockHash !== previousHash) {
					errorLog.push(i);
				}
			}

		}
		if (errorLog.length > 0) {
			console.log('Block errors = ' + errorLog.length);
			console.log('Blocks: ' + errorLog);
		} else {
			console.log('No errors detected');
		}
	}
}



module.exports = {
	Block: Block,
	Blockchain: Blockchain
}