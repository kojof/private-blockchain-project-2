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
var message = 'This is an example of a signed message.';
 
var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
console.log(signature.toString('base64'));

console.log(bitcoinMessage.verify(message, '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ', signature));