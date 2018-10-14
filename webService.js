const express = require('express');
const app = express();
app.use(express.json());

let levelSandbox = require('./levelSandbox');
let Block = require('./simpleChain').Block
let BlockChain = require('./simpleChain').Blockchain

let blockChain = new BlockChain();

app.get('/', (req, res) => res.send('hello world'));


app.get('/block/:blockheight', async function (req, res) {
    let block;
    try {

        if (!req.params.blockheight) 
        {
            res.status(400).send('blockheight parameter is required');
        }

        block = await blockChain.getBlock(req.params.blockheight);
    } 
    
    catch (error) 
    {
        res.status(500).json({
            error: error.toString()
        });
    }

    res.send(JSON.parse(block));
});

app.post('/block', async function (req, res) {
    try {
        if (!req.body.body) 
        {
            res.status(400).send('Name parameter is required');
        }

        let body = req.body.body;

        const block = new Block(body);

        await blockChain.addBlock(block);
        res.json(block);
    } 
    
    catch (error) 
    {
        res.status(500).json({error: error.toString()});
    }
});




const port = process.env.port || 8000;
app.listen(port, () => console.log(`App listening on port ${port}...`));