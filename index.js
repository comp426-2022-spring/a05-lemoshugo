// Place your server entry point code here

const { exit } = require('process')
const express = require('express')
const app = express()
const morgan = require('morgan')
const fs = require('fs')



const args = require('minimist')(process.argv.slice(2), {
    boolean: ['debug', 'log'],
    default: {
        debug: false,
        log: false,
    }
}) 
args['port', 'log', 'debug']

console.log(args)

if (args.help) {
    console.log(
        "server.js [options] \n" + 
        "\n" +
        "\t --port \t Set the port number for the server to listen on. must be an integer between 1 and 65535.\n" +
        "\t --debug \t If set to `true`, creates endpoints /app/log/access/ which returns a JSON access log from the database and /app/error/ which throws an error with the message " +
            "\"Error test successful.\" " + "Defaults to `false`. \n" +
        "\t --log \t If set to false, no log files are written. Defaults to 'true'. Logs are always written to database. \n" +
        "\t --help \t Return this message and exit."
    )
    exit(0);
}

const database = require('./database')

// Serve static HTML files
app.use(express.static('./public'));

app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Start an app server

const port = args.port || 5555

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});


app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respind with status message 'OK'
        res.statusMessage = "OK";
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain '});
        res.end(res.statusCode + ' ' + res.statusMessage);
});

// Middleware function
app.use( (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }

    const stmt = database.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)

    next();
})

if (args.debug == true) {
    app.get('/app/log/access', (req, res) => {
        const select = database.prepare('SELECT * FROM accesslog').all();
        res.status(200).json(select);
    })

    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.')
    })
}

if (args.log == true) {
    const WRITESTREAM = fs.createWriteStream('FILE', { flags: 'a' });
    app.use(morgan('FORMAT', { stream: WRITESTREAM }));
}

// Default response for any other request 

app.use(function(req, res) {
  res.status(404).send('404 NOT FOUND')
});

// Define check endpoint

app.post('/app/flip', (req, res) => {
    res.send({"flip": coinFlip()});
})

app.post('/app/flips/:number', (req, res) => {  
    const flipResult = coinFlips(req.body.number);

    
    const result = {
        "raw": flipResult,
        "summary": countFlips(flipResult)
    }

    res.json(result);  
})

app.post('/app/flip/call/heads', (req, res) => {

    res.status(200).json(flipACoin("heads"));
})

app.post('/app/flip/call/tails', (req, res) => {

    res.status(200).json(flipACoin("tails"));
})

// Helper functions

function coinFlip() {
    const options = ["heads", "tails"];
  
    const randomNumber = Math.floor(Math.random() * options.length);
  
    return options[randomNumber];
}

function coinFlips(flips) {
    const result = [];

    for (let i = 0; i < flips; i++) {
      result[i] = coinFlip();
    }

    return result;
}

function countFlips(array) {
    let headCount = 0;
    let tailsCount = 0;
    
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "heads") {
        headCount++;
      } 
  
      if (array[i] == "tails") {
        tailsCount++;
      }
    }
  
    if (headCount == 0 || tailsCount == 0) {
      if (headCount == 0) {
        return "{ tails: " + tailsCount + " }";
      } else if (tailsCount == 0) {
        return "{ heads: " + headCount + " }";
      }
    }

    const result = {
      "tails": tailsCount,
      "heads": headCount
    }
  
    return result;
}

function flipACoin(call) {
    let flipResult = "";
  
    let flip = coinFlip();
  
    if (flip == call) {
      flipResult = "win";
    } else {
      flipResult = "lose";
    }
    
    const result = {
      "call": call,
      "flip": flip,
      "result": flipResult
    }
  
    return result;
}