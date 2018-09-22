let lib = require('./lib');

let promise =   lib.getLevelDBDataTest(10);
promise.then(console.log("yes")).catch("nooo!!!");

// function xxxx(x) {
//   let promise = lib.getLevelDBDataTest(4);
//   promise.then(console.log("yes")).catch("nooo!!!");
//  }
  
// xxxx(10);




