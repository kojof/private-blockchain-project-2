let Block = require('./simpleChain').Block
let BlockChain = require('./simpleChain').Blockchain
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.use(express.json());
app.use(express.urlencoded());
let blockChain = new BlockChain();


app.get('/', (req, res) => res.send('hello world'));

app.post('/requestValidation', async function (req, res) {
    try {
        if (!req.body.address) {
            res.status(400).send('address parameter is required');
        }

        const walletAddress = req.body.address;
        const starRegistry = "starRegistry";
        let timeStamp = Date.now();
        if (localStorage.getItem(walletAddress) != null) {
            timeStamp = localStorage.getItem(walletAddress);
        }

        let timeOut = getTimeValidationWindow(walletAddress);

        console.log(`${timeOut} ms have passed since I was scheduled`);

        const messageFormat = `${walletAddress}:${timeStamp}:${starRegistry}`;
        var response = {
            "address": walletAddress,           
            "requestTimeStamp": timeStamp,
            "message": messageFormat,
            "validationWindow": timeOut
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
    const signature = req.body.signature;
    const starRegistry = "starRegistry";

    const timeStamp = localStorage.getItem(walletAddress);

    let messageFormat = `${walletAddress}:${timeStamp}:${starRegistry}`;

    const verifySignature = bitcoinMessage.verify(messageFormat, walletAddress, signature);

    const messageSignature = verifySignature ? "valid" : "invalid";

    let timeOut = getTimeValidationWindow(walletAddress);

    if (timeOut == 0) {
        res.json("Time Validation Window has expired, pls resubmit request.");
        localStorage.removeItem(walletAddress);
        return;
    }

    var response = {
        "registerStar": verifySignature,
        "status": {
            "address": walletAddress,
            "requestTimeStamp": timeStamp,
            "message": messageFormat,
            "validationWindow": timeOut,
            "messageSignature": messageSignature
        }
    };

    res.json(response);   
    localStorage.setItem("registerStar", verifySignature);     
});

app.post('/block', async function (req, res) {

    if (!req.body.address) {
        res.status(400).send('address is missing');
        return;
    } else {
        const timeStamp = localStorage.getItem(req.body.address);
        if (!timeStamp) {
            res.status(400).send('address has not been validated');
            return;
        }
    };

    if(localStorage.getItem("registerStar") == null)
    {
        res.status(400).send('please register star before proceeding to this step');
        return;
    }    

    const walletAddress = req.body.address;
    const star = req.body.star
    const convertMessage = JSON.stringify(star);
    let message = JSON.parse(convertMessage);

    const story = message.story;
    const right_ascension = message.ra;
    const declination = message.dec;
    const storyBuffer = Buffer.from(story, 'ascii');

    //check that star is valid
    if (!star || !star.ra || !star.dec || !star.story) {
        res.status(401).json({
            error: "Invalid star object"
        });
        return;
    }

    //check that story does not have non-ascii characters
    if (!isASCII(storyBuffer)) {
        res.status(401).json({
            error: "Story must only contain Ascii Characters"
        });
        return;
    }

    //check lenght of story is not greater than 500 bytes
    if (!checkByteLength(storyBuffer)) {
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
    localStorage.removeItem(walletAddress);
    localStorage.removeItem("registerStar");    
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

    let timeOut = 0;
    if (localStorage.getItem(walletAddress) == null) {
        let timeStamp = Date.now();
        timeOut = 300;
        localStorage.setItem(walletAddress, timeStamp);
    } else {
        const savedTimeStamp = localStorage.getItem(walletAddress);
        timeOut = 300 - ((Date.now() - savedTimeStamp) / 1000).toFixed(0);
        if (timeOut <= 0) {
            return 0;
        }
    }
    return timeOut;
}

//check if any characters are non-ascii
function isASCII(str) {
    return /^[\000-\177]*$/.test(str);
}

//check the length of a string is less than 500 bytes
function checkByteLength(str) {
    if (str.byteLength >= 500) {
        return false;
    }
    return true;
}


const port = process.env.port || 8000;
app.listen(port, () => console.log(`App listening on port ${port}...`));