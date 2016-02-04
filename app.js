var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);


fs.exists('output.txt', function(exists) {
    if (exists) {
        fs.unlinkSync('output.txt');
    }
});

main_page = 'http://link.springer.com/search?query=%28%22Wireless+Sensor%22+OR+%22Sensor+networks%22+OR+%22Actuator+Networks%22+OR+%22Internet+of+Things%22+OR+%22Web+of+Things%22%29+AND+%28%22systematic+literature+review%22+OR+%22systematic+review%22+OR+%22systematic+mapping%22+OR+%22mapping+study%22+OR+%22systematic+literature+mapping%22%29';

var length = 0;
var page = 0;
var title, abstract, keywords, authors, year;

request(main_page, function(error, response, html){ //<-- abre o request(main_page
if(!error){ //<-- abre o if(!error) do request
    var $ = cheerio.load(html);

    $('span.number-of-pages').filter(function(){
        length = $(this).text();
    })
  } //<-- fecha o if(!error) do request

var url = "";
/*Site não utilizado, mas pode ser útil:
https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
*/

while(page < length){ //abre o while(page < length)
    url = 'http://link.springer.com/search/page/' + (page+1) + '?query=%28%22Wireless+Sensor%22+OR+%22Sensor+networks%22+OR+%22Actuator+Networks%22+OR+%22Internet+of+Things%22+OR+%22Web+of+Things%22%29+AND+%28%22systematic+literature+review%22+OR+%22systematic+review%22+OR+%22systematic+mapping%22+OR+%22mapping+study%22+OR+%22systematic+literature+mapping%22%29';
    request(url, function(error, response, html){ //abre o request(url
    if(!error){//abre o error do request(url
        var $ = cheerio.load(html);

        $('#results-list li .title').each(function(i, elm) {
            url = 'http://link.springer.com' + $(this).attr('href');
            request(url, function(error, response, html){
              var json = { title : "", abstract : "", keywords : "", authors : "", year : ""};
              if(!error){
                  var $ = cheerio.load(html);
                  number = i+1;

                  //Title
                  $('h1.ArticleTitle').filter(function(){
                      var data = $(this);
                      json.title = data.text();
                  })

                  //Title
                  $('h1.ChapterTitle').filter(function(){
                      var data = $(this);
                      json.title = data.text();
                  })

                  //Abstract
                  $('p.Para').filter(function(){
                      var data = $(this);
                      json.abstract = data.text();
                  })

                  //Keywords
                  $('span.Keyword').filter(function(){
                      var data = $(this);
                      if(json.keywords == "")
                        json.keywords = data.text();
                      else
                        json.keywords = json.keywords + " - " + data.text();
                  })

                  //Authors
                  $('span.AuthorName').filter(function(){
                      var data = $(this);
                      if(json.authors == "")
                        json.authors = data.text();
                      else
                        json.authors = json.authors + " ; " + data.text();
                  })

                  //Year
                  $('div#abstract-actions.panel').filter(function(){
                      var a = $(this);
                      json.year = $('input[name="copyrightyear"]').prop('value');
                  })

                  if(((JSON.stringify(json, 4, 4)).toLowerCase().indexOf("wireless sensor") > -1 ||
                (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("wireless networks") > -1||
              (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("actuator networks") > -1 ||
            (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("internet of things") > -1 ||
          (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("web of things") > -1) &&
            ((JSON.stringify(json, 4, 4)).toLowerCase().indexOf("systematic literature review") > -1 ||
              (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("systematic review") > -1 ||
               (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("systematic mapping") > -1 ||
                 (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("mapping study") > -1 ||
                   (JSON.stringify(json, 4, 4)).toLowerCase().indexOf("systematic literature mapping") > -1)) {
                      fs.appendFile('output.txt', JSON.stringify(json, 4, 4));
                   }
              }
              else {
                  console.log('Erro: '+error);
              }
            })
        })

      }//fecha o error do request(url
    })//fecha o request(url
    page++;
  } //fecha o while(page < length)
  console.log("Arquivo criado com sucesso.")
}) //<-- fecha o request(main_page

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
