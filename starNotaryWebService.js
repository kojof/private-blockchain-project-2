let Block = require('./simpleChain').Block
let BlockChain = require('./simpleChain').Blockchain
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');

app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(express.json());
app.use(express.urlencoded());

let timeValidationWindow = new Map();
let blockChain = new BlockChain();

app.get('/', (req, res) => res.send('hello world'));

// app.use(function (req, res, next) {
//     res.setTimeout(300000, function () {
//         const address = req.body.address;
//         console.log('Request has timed out.');
//         timeValidationWindow.delete(address);
//         //     res.send(408);
//     });

//     next();
// });

app.post('/requestValidation', async function (req, res) {
    try {
        if (!req.body.address) {
            res.status(400).send('address parameter is required');
        }

        const walletAddress = req.body.address;
        const starRegistry = "starRegistry";
        let timeStamp = Date.now();

        const messageFormat = `${walletAddress}:${timeStamp}:${starRegistry}`;
    
        let timeout = getTimeValidationWindow(walletAddress);

        timeValidationWindow.set(walletAddress, timeStamp);

        console.log(`${timeout} ms have passed since I was scheduled`);

        var response = {
            "address": walletAddress,
        //    "signature": signature,
            "requestTimeStamp": timeStamp,
            "message": messageFormat,
            "validationWindow": timeout
        };

        res.json(response);


    } catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }
});


app.post('/message-signature/validate', function (req, res) {
    const walletAddress = req.body.address;  
    const starRegistry = "starRegistry";

    const timeStamp = timeValidationWindow.get(walletAddress);

    let messageFormat = `${walletAddress}:${timeStamp}:${starRegistry}`;

    var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
    var privateKey = keyPair.privateKey;
     var signature = bitcoinMessage.sign(messageFormat, privateKey, keyPair.compressed).toString('base64');

    const verifySignature = bitcoinMessage.verify(messageFormat, walletAddress, signature);

    const messageSignature = verifySignature ? "valid" : "invalid";

    let timeout = getTimeValidationWindow(walletAddress);

    if(timeout ==0)
    {
        res.json("Time Validation Window has expired, pls resubmit request.");
    }

    var response = {
        "registerStar": verifySignature,
        "status": {
            "address": walletAddress,
            "requestTimeStamp": timeStamp,
            "message": messageFormat,
            "validationWindow": timeout,
            "messageSignature": messageSignature
        }
    };

    res.json(response);
});

app.post('/block', async function (req, res) {
    const walletAddress = req.body.address;

    if (!walletAddress) {
        res.status(400).send('address is missing');
        return;
    } else {
        const timeStamp = timeValidationWindow.get(walletAddress);
        if (!timeStamp) {
            res.status(400).send('address has not been validated');
            return;
        }
    }

    const star = req.body.star;

    if(!star || !star.ra || !star.dec || !star.story) {
        res.status(401).json({
            error: "Invalid star object"        
        });
        return;
    }

    const convertMessage = JSON.stringify(star);
    let message = JSON.parse(convertMessage);

    const story = message.story;
    const right_ascension = message.ra;
    const declination = message.dec;
    const storyBuffer = Buffer.from(story, 'ascii');
    
    if(!isASCII(storyBuffer))
    {
        res.status(401).json({
            error: "Story must only contain Ascii Characters"        
        });
        return;
    }

    if(!checkByteLength(storyBuffer))
    {
        res.status(401).json({
            error: "Story cannot be greater than 500 bytes"        
        });
        return;
    }

    const body = {
        "address": walletAddress,
        "star": {
            "ra": right_ascension,
            
            "dec": declination,
            "story": storyBuffer.toString('hex')
        }
    };
   
    var response = await blockChain.addBlock(new Block(body));
    res.json(response);
    timeValidationWindow.delete(walletAddress);

});


app.get('/stars/address::address', async function (req, res) {
    let block;
    try {

        if (!req.params.address) {
            res.status(400).send('address parameter is required');
        }
        const walletAddress = req.params.address;
        const response = await blockChain.getBlocksByAddress(walletAddress);
        
        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }
});


app.get('/stars/hash::hash', async function (req, res) {
    let block;
    try {

        if (!req.params.hash) {
            res.status(400).send('hash parameter is required');
        }
        const hash = req.params.hash;
        const response = await blockChain.getBlocksByHash(hash);
        
        res.json(response);
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({
            error: error.toString()
        });
    }
});


function getTimeValidationWindow(walletAddress) {
    let timeout = 0;
    if (timeValidationWindow.get(walletAddress) == null) 
    {
        timeout = 300;       
    } 
    else 
    {
        const savedTimeStamp = timeValidationWindow.get(walletAddress);
        timeout = 300 - ((Date.now() - savedTimeStamp) / 1000).toFixed(0);       
      
    }
    return timeout;
}


    function isASCII(str) {
        return  /^[\000-\177]*$/.test(str) ;
    }

    function  checkByteLength(str) 
    {
        if(str.byteLength >= 500)
        {
            return false;
        }
        return true;
    }
   

const port = process.env.port || 8000;
app.listen(port, () => console.log(`App listening on port ${port}...`));