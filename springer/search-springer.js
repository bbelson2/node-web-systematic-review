module.exports = function(){
      var fs = require('fs');
      var request = require('request');
      var cheerio = require('cheerio');
      var json2csv = require('json2csv');

      return {
            execute: function(){
                  console.log('Application Start... Wait!');
                  fs.exists('output.csv', function(exists) {
                      if (exists) {
                          fs.unlinkSync('output.csv');
                      }
                  });

                  main_page = 'http://link.springer.com/search?query=%28%22Wireless+Sensor%22+OR+%22Sensor+networks%22+OR+%22Actuator+Networks%22+OR+%22Internet+of+Things%22+OR+%22Web+of+Things%22%29+AND+%28%22systematic+literature+review%22+OR+%22systematic+review%22+OR+%22systematic+mapping%22+OR+%22mapping+study%22+OR+%22systematic+literature+mapping%22%29';

                  var length = 0;
                  var title, abstract, keywords, authors, year;
                  var fields = ['title', 'abstract', 'keywords', 'authors', 'year'];
                  var number_articles = 0;
                  //var logStream = fs.createWriteStream('output.csv', {'flags': 'a'});
                  //console.log(articles);
                  request(main_page, function(error, response, html){ //<-- abre o request(main_page
                  if(!error){ //<-- abre o if(!error) do request
                      var $ = cheerio.load(html);

                      $('span.number-of-pages').filter(function(){
                          length = $(this).text();
                      });

                      $('h1.number-of-search-results-and-search-terms').filter(function(){
                            number_articles = $(this).children().first().text();
                            //console.log('number-articles:' + number_articles);
                      });


                    } //<-- fecha o if(!error) do request

                  var url = "";
                  /*Site não utilizado, mas pode ser útil:
                  https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
                  */
                  (function(){

                      articles = [];
                      count = 1;
                      var page = 0;

                      console.log('Reading pages NOW!');
                      while(page < length){ //abre o while(page < length)
                          url = 'http://link.springer.com/search/page/' + (page+1) + '?query=%28%22Wireless+Sensor%22+OR+%22Sensor+networks%22+OR+%22Actuator+Networks%22+OR+%22Internet+of+Things%22+OR+%22Web+of+Things%22%29+AND+%28%22systematic+literature+review%22+OR+%22systematic+review%22+OR+%22systematic+mapping%22+OR+%22mapping+study%22+OR+%22systematic+literature+mapping%22%29';
                          //articles.push = ('1', '2', '3'); //=======> reconhece article até aqui; <===========
                          request(url, function(error, response, html){ //abre o request(url
                          if(!error){//abre o error do request(url
                              var $ = cheerio.load(html);
                              $('#results-list li .title').each(function(i, elm) {
                                  url = 'http://link.springer.com' + $(this).attr('href');

                                  request(url, function(error, response, html){
                                        //console.log('count: ' + count);
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
                                            //fs.appendFile('output.txt', JSON.stringify(json,4,4));
                                            articles.push(json);
                                         }

                                         count = count + 1;
                                         if(count == number_articles){
                                               console.log('Writing articles in file.');
                                               json2csv({ data: articles, fields: fields }, function(err, csv) {
                                                 if (err) console.log(err);
                                                 fs.writeFile('output.csv', csv, function(err) {
                                                   if (err) throw err;
                                                   console.log('File Saved!\nApplication finished, thanks!');

                                                 });
                                               });
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
                    }())
                  }) //<-- fecha o request(main_page
            }
      };
}
