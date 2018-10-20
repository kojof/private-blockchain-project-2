//let levelSandbox = require('./levelSandbox');
//let Block = require('./simpleChain').Block
//let BlockChain = require('./simpleChain').Blockchain

//  let blockChain = new BlockChain();
// for(var i =0; i < 10; i++)
// {   
//     blockChain.addBlock(new Block("test data " + i));
// }

// blockChain.validateChain();
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
var privateKey = keyPair.privateKey;
var message = "1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN:1539996057049:starRegistry";
 
var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed).toString('base64');
console.log(signature);

console.log(bitcoinMessage.verify(message, '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN', signature));

