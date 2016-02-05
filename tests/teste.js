var request = require('request');
var cheerio = require('cheerio');
url = 'http://nodebr.com/nodejs-e-mongodb-introducao-ao-mongoose/';
global.name = [];




const square = require('./square');
var mySquare;

function hello2(){
    console.log('First');
}

function getMyBody(url, callback) {
      request(url, function (error, response, body) {
          if (error || response.statusCode !== 200) {
            return callback(error || {statusCode: response.statusCode});
          }
          callback(null, body);
      });
}

function hello(){
    setTimeout(hello2, 2000); //executa primeiro getMyBody
    //setTimeout(hello2, 100); //executa primeiro hello2
    console.log('Fim do lopp!');
}


getMyBody(url,
  function(err, body) { //função enviada como callback
      if (err) {
          console.log(err);
      } else {
          var $ = cheerio.load(body);
          $('h1.page-header').filter(function(){
              myBody = $(this).text();
              console.log('in function: ' + global.name);
              global.name.push(200);
              //mySquare = square(3);
              //console.log(`The area of my square is ${mySquare.area()}`);
              console.log('in function: ' + global.name);
              //console.log(myBody);
              console.log(global.name);
          });
      }
});

getMyBody(url,
  function(err, body) { //função enviada como callback
      if (err) {
          console.log(err);
      } else {
          var $ = cheerio.load(body);
          $('h1.page-header').filter(function(){
              myBody = $(this).text();
              console.log('in function: ' + global.name);
              global.name.push(300);
              //mySquare = square(3);
              //console.log(`The area of my square is ${mySquare.area()}`);
              console.log('in function: ' + global.name);
              //console.log(myBody);
              console.log(global.name);
          });
      }
});

//hello();



/*function f() {
    var result = [];
    for (var i=0; i<3; i++) {
        var func = function () {
            return i;
        };
        result.push(func);
    }
    console.log('result: ' + result);
    return result;
}
console.log('=====> ' + f()[1]());  // 3*/
