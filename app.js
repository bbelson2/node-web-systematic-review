/*
"name": "node-web-systematic-review",
"version": "1.0.0",
"author": "Luis Augusto Melo Rohten",
"date": 05/02/2016,
*/

// Initialisation
if (global.gc) {
    global.gc();
} else {
    //console.log('Garbage collection unavailable.  Pass --expose-gc '
    //  + 'when launching node to enable forced garbage collection.');
}

// Invoke Springer downlooad and close
var springer = require('./springer/search-springer');
springer().execute();

