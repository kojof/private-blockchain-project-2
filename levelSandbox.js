/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

module.exports = {

    addLevelDBData: addLevelDBData,
    getLevelDBData: getLevelDBData,
    getBlockHeight: getBlockHeight,
    getBlocksByAddress : getBlocksByAddress,
    getBlocksByHash : getBlocksByHash,
    getBlocksByHeight : getBlocksByHeight    
}

// Add data to levelDB with key/value pair
async function addLevelDBData(key, value) {
    try {
        var promise = await db.put(key, value);
        return promise;
    } catch (error) {
        console.error(error);
    }
}

// Get data from levelDB with key
async function getLevelDBData(key) {
    try {
        let promise = db.get(key);
        return promise;
    } catch (error) {
        console.error(error);
    }
}

// Get Block Height
function getBlockHeight() {
    let i = 0;
    return new Promise((resolve, reject) => db.createReadStream().on('data', function (data) {
        i++;
    }).on('error', function (err) {
        return console.log('Unable to get block height!', err);
        reject(err);
    }).on('close', function () {
       // console.log("Block Height is " + i);
        resolve(i);
    }))
};

// Get Blocks by Address
function getBlocksByAddress(walletAddress) 
{  
    let blocks= [];   
    return new Promise((resolve, reject) => db.createReadStream().on('data', function (data) {    
       
        var block  = JSON.parse(data.value);
       
        if(block != null)
        {
            if (block.body.address == walletAddress)
            {               
                blocks.push(block);             
            }
        }   
       
    }).on('error', function (err) {
        return console.log('Unable to get blocks!', err);
        reject(err);
    }).on('close', function () {
       // console.log("Block Height is " + i);
    //   console.log(blocks);
        resolve(blocks);
    }))
};

// Get Blocks by Hash
function getBlocksByHash(hash) 
{  
    let blocks= [];   
    return new Promise((resolve, reject) => db.createReadStream().on('data', function (data) {    
       
        var block  = JSON.parse(data.value);
       
        if(block != null)
        {
           
            if (block.hash == hash)
            {               
              //  console.log(block);
                blocks.push(block);             
            }
        }   
       
    }).on('error', function (err) {
        return console.log('Unable to get blocks!', err);
        reject(err);
    }).on('close', function () {
       // console.log("Block Height is " + i);
    //   console.log(blocks);
        resolve(blocks);
    }))
};

function getBlocksByHeight(height) 
{  
    let blocks= [];   
    return new Promise((resolve, reject) => db.createReadStream().on('data', function (data) {    
       
        var block  = JSON.parse(data.value);
       
        if(block != null)
        {           
            if (block.height == height)
            {               
              //  console.log(block);
                blocks.push(block);             
            }
        }   
       
    }).on('error', function (err) {
        return console.log('Unable to get blocks!', err);
        reject(err);
    }).on('close', function () {
       // console.log("Block Height is " + i);
    //   console.log(blocks);
        resolve(blocks);
    }))
};


