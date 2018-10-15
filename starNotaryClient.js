const request = require('request');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
let message;
let walletAddress;


request.post('http://localhost:8000/requestValidation',  //1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN
{
    json: true
}, (err, res, body) => 
{
    if (err) 
    {
        return console.log(err);
    }
    
    //console.log(body.address);
    message = body.message;
    walletAddress = body.address;

    var keyPair = bitcoin.ECPair.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
    var privateKey = keyPair.privateKey;
    var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed).toString('base64');     
    
    // Set the headers
    var headers = {
        'Content-Type': 'application/json'
    };

    // Configure the request
    let options = {
        url: 'http://localhost:8000/message-signature/validate',
        method: 'POST',
        headers: headers,
        form: {
            'address': walletAddress,
            'signature': signature
        }
    };

    //Start the request
    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // Print out the response body
       //     console.log(response.body);

            const star = {
                "star": {
                    "dec": "-26° 29'\'' 24.9",
                    "ra": "16h 29m 1.0s",
                    "story": "Found star using https://www.google.com/sky/"
                }
            };
        
            // Configure the request
            options = {
                url: 'http://localhost:8000/block',
                method: 'POST',
                headers: headers,
                form: {
                    'address': walletAddress,
                    'star': star
                }
            };   
            
            // request(options, function (error, response, body) 
            // {

            //     if (!error && response.statusCode == 200) {
            //         // Print out the response body
            //         console.log(response.body);
            //     }
            // });          
        }
    }) 
});