let levelSandbox = require('./levelSandbox');
let Block = require('./simpleChain').Block
let BlockChain = require('./simpleChain').Blockchain



let block = new Block();
let blockChain = new BlockChain();
blockChain.addBlock(block);
blockChain.validateChain();