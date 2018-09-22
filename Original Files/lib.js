const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


module.exports = {
    getLevelDBDataTest: doubleAfter2Seconds,
    loadScript: loadScript

  };

  

  function doubleAfter2Seconds(x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x * 2);
      }, 2000);
    });
  }
  

  async function loadScript(x) {
   let promise = await doubleAfter2Seconds(4);
   //promise.then(console.log("yes")).catch("nooo!!!");
   console.log(promise);
  }
  
  
  //loadScript(4);