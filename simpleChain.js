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

class Blockchain {
	constructor() {

		this.checkIfGenesisBlockExists();
	}

	// Check If Genesis Block exists, if so, don't add it
	async checkIfGenesisBlockExists() {
		let blockHeight = await this.getBlockHeight();
		if (blockHeight === 0) {
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

		return newBlock;
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
	async validateBlock(blockHeight) {
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
			console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
			return false;
		}
	}

	// Validate blockchain
	async validateChain() {
		let errorLog = [];

		// get block height
		let blockHeight = await this.getBlockHeight();

		for (var i = 0; i < blockHeight; i++) {
			if (i === 0) {
				this.validateBlock(i);
			} else if (i > 0) {
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

	async getBlocksByAddress(walletAddress) {
		try {
			// get blocks
			let blocks = await levelSandbox.getBlocksByAddress(walletAddress);
			let blockChain = this.createBlocks(blocks);
			return blockChain;
		} catch (error) {

		}
	}

	async getBlocksByHash(hash) {
		try {
			// get blocks
			let blocks = await levelSandbox.getBlocksByHash(hash);
			let blockChain = this.createBlocks(blocks);
			return blockChain;
		} catch (error) {

		}
	}

	async getBlocksByHeight(height) {
		let blockChain = [];
		try {

			// get blocks
			let blocks = await levelSandbox.getBlocksByHeight(height);
			let blockChain = this.createBlocks(blocks);
			return blockChain;
		} catch (error) {

		}
	}


	async createBlocks(blocks) {
		let blockChain = [];

		for (var i = 0; i < blocks.length; i++) {
			let block = (blocks[i]);

			const hash = block.hash;
			const height = block.height;
			const address = block.body.address;
			const right_ascension = block.body.star.ra;
			const story = block.body.star.story;
			const declination = block.body.star.dec;
			let storyDecoded = '';
			const time = block.time;
			const previousBlockHash = block.previousBlockHash;

			if (story != "") {
				storyDecoded = Buffer.from(story, 'hex').toString('utf8');
			}

			let recreateBlock = {
				"hash": hash,
				"height": height,
				"body": {
					"address": address,
					"star": {
						"ra": right_ascension,
						"dec": declination,
						"story": story,
						"storyDecoded": storyDecoded
					}
				},
				"time": time,
				"previousBlockHash": previousBlockHash
			};
			blockChain.push(recreateBlock);
		}

		blockChain = JSON.stringify(blockChain);
		blockChain = JSON.parse(blockChain);
		return blockChain;
	}
}

module.exports = {
	Block: Block,
	Blockchain: Blockchain
}