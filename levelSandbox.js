/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

module.exports = {

    addLevelDBData: addLevelDBData,
    getLevelDBData: getLevelDBData,
    getBlockHeight: getBlockHeight
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
}

;