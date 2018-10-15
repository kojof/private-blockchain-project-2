let Block = require('./simpleChain').Block
let BlockChain = require('./simpleChain').Blockchain
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(express.json());
app.use(express.urlencoded());
let timeValidationWindow = [];

let blockChain = new BlockChain();

app.get('/', (req, res) => res.send('hello world'));

app.post('/requestValidation/:address', async function (req, res) {
    try {
        if (!req.body.address) {
            res.status(400).send('address parameter is required');
        }

        const walletAddress = req.body.address;
        const starRegistry = "starRegistry";
        const timeStamp = new Date().getTime();
        timeValidationWindow.push({
            walletAddress: walletAddress,
            timeValidation: timeStamp
        });

        const messageFormat = `${walletAddress}:${timeStamp}:${starRegistry}`;

        //Use IF statement to delete validation request from memory if elapsed time exceeds 300, setTimeout() function

       
        var response = {
            "address": walletAddress,
            "requestTimeStamp": timeStamp,
            "message": messageFormat,
            "validationWindow": 300


        };
        // console.log(response);

        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }
});

app.post('/message-signature/validate', function (req, res) {
    const walletAddress = req.body.address;
    const signature = req.body.signature;
    const starRegistry = "starRegistry";
    console.log(walletAddress);
    const timeStamp =  timeValidationWindow.find(x => x.walletAddress == walletAddress).timeValidation;
   
    let messageFormat = `${walletAddress}:${timeStamp}:${starRegistry}`;
  
    const verifySignature = bitcoinMessage.verify(messageFormat, walletAddress, signature);
    const messageSignature = verifySignature ? "valid" : "invalid";

    var response = JSON.stringify({
        "registerStar": verifySignature,
        "status": {
            "address": walletAddress,
            "requestTimeStamp": timeStamp,
            "message": messageFormat,
            "validationWindow": 193,
            "messageSignature": messageSignature
        }
    });
    // console.log(req.body.signature);
    res.json(response);
});

app.post('/block', async function (req, res) {
    const walletAddress = req.body.walletAddress;
    const star = req.body.star;
    const convertMessage = JSON.stringify(star);
    let message = JSON.parse(convertMessage);

    const story = message.star.story;
    const right_ascension = message.star.story.ra;
    const declination = message.star.story.dec;
    const storyBuffer = Buffer.from(story, 'ascii');

    const body = {
        "address": walletAddress,
        "star": {
            "ra": right_ascension,
            "dec": declination,
            "story": storyBuffer.toString('hex')
        }
    };

   // console.log(req.body);

    blockChain.addBlock(new Block(body)); 
    
    res.json();
});


app.get('/stars/address/:address', async function (req, res) {
    let block;
    try {       

        if (!req.params.address) {
            res.status(400).send('address parameter is required');
        }
        const walletAddress = req.params.address;
        const response = await blockChain.getBlocksByAddress(walletAddress);
        //console.log(response);
        res.json(response);    
    } 
    
    catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }    
});


app.get('/stars/hash/:hash', async function (req, res) {
    let block;
    try {       

        if (!req.params.hash) {
            res.status(400).send('hash parameter is required');
        }
        const hash = req.params.hash;
        const response = await blockChain.getBlocksByHash(hash);
       // console.log(response);
        res.json(response);    
    } 
    
    catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }    
});

app.get('/block/:height', async function (req, res) {
    let block;
    try {       

        if (!req.params.height) {
            res.status(400).send('height parameter is required');
        }
        const height = req.params.height;
        const response = await blockChain.getBlocksByHeight(height);
        //console.log(response);
        res.json(response);    
    } 
    
    catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }    
});


const port = process.env.port || 8000;
app.listen(port, () => console.log(`App listening on port ${port}...`));