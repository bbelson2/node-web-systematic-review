// Based on code by Luis Augusto Melo Rohten
// https://github.com/luisaugustomelo/node-web-systematic-review

module.exports = function () {
  var fs = require('fs');
  var request = require('request');
  var cheerio = require('cheerio');

  /////////////////////////////////////////////////////////////////////
  // Constants
  /////////////////////////////////////////////////////////////////////
  var theLanguage = 'En';
  var theExpr = '(coroutine OR coroutines OR "lightweight+threads"'
    + ' OR "co-routine" OR "co-routines")'
    + ' AND (IoT OR "Internet of Things" OR "Cyber Physical Systems"'
    + ' OR "Cyber-physical Systems" OR RTOS OR "Real-time Operating Systems"'
    + ' OR "Embedded Systems" OR WSN OR "Wireless sensor networks" OR WSAN)';
  var theStartDate = 2007;
  var theEndDate = 2017;
  var theOutputFile = 'springerlink.bib';

  /////////////////////////////////////////////////////////////////////
  // URL builder helpers
  /////////////////////////////////////////////////////////////////////

  // Apply HTML escaping to the various parts of the query URL
  var esc = function (raw) {
    return raw
      .replace(/\"/g, '%22')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/ /g, '+');
  };
  var datePart = function (startYear, endYear) {
    return "date-facet-mode=between&facet-start-year=" + startYear
      + "&facet-end-year=" + endYear;
  };
  var languagePart = function (lang) {
    return esc('facet-language="' + lang + '"');
  };
  var queryPart = function (expr) {
    return 'query=' + esc(expr);
  };

  var buildUrl = function (page) {
    return 'https://link.springer.com/search'
      + ((page >= 0) ? '/page/' + (page + 1) : '')
      + '?' + datePart(theStartDate, theEndDate) + '&' + languagePart(theLanguage) + '&' + queryPart(theExpr);
  };

  /////////////////////////////////////////////////////////////////////
  // Logger
  /////////////////////////////////////////////////////////////////////

  var log_header = function() {
    console.log('level,description,page,item,url,data0,data1,data2');
  }
  var log_event = function(level, description, page, item, url, data0, data1, data2) {
    console.log(level + ',' + description + ',' + (page == null ? '' : page) + ',' 
      + (item == null ? '' : item) + ',' + (url == null ? '' : url) + ',' 
      + (data0 == null ? '' : data0) + ',' + (data1 == null ? '' : data1) + ',' + (data2 == null ? '' : data2));
  }

  /////////////////////////////////////////////////////////////////////
  // The procedure
  /////////////////////////////////////////////////////////////////////

  return {
    execute: function () {
      log_header();
      log_event(0, "Application start");
      fs.exists(theOutputFile, function (exists) {
        if (exists) {
          log_event(0,'Deleting output file',null,null,theOutputFile);
          fs.unlinkSync(theOutputFile);
        }
      });

      main_page = buildUrl(-1);
      var num_pages = 0;
      var num_articles = 0;
      var num_citations = 0;
      var num_failures = 0;
      var num_empty = 0;
      var results_reported = false;

      var finishIfReady = function () {
        if (!results_reported && (num_citations + num_failures + num_empty == num_articles)) {
          results_reported = true;
          log_event(0, 'Complete - writing articles to file.', null, null, theOutputFile, num_citations, num_empty, num_failures);
          fs.writeFile(theOutputFile, bibs, function (err) {
            if (err) throw err;
            log_event(0, 'Closing');
          });
        }
      };

      log_event(0, 'Loading main page', null, null, main_page);
      request(main_page, function (error, response, html) { 
        log_event(0, 'Received main page', null, null, main_page);
        if (!error) { //<-- abre o if(!error) do request
          var $ = cheerio.load(html);

          $('span.number-of-pages').first().filter(function () {
            num_pages = $(this).text();
            log_event(0, 'num_pages', null, null, main_page, num_pages);
          });

          $('h1.number-of-search-results-and-search-terms').first().filter(function () {
            num_articles = $(this).children().first().text();
            log_event(0, 'num_articles', null, null, main_page, num_articles);
          });
        }
        else {
          log_event(0, 'Main page failed', null, null, main_page, error);
        }

        var url = '';
        /* Useful information here...
          https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
        */
        (function () {

          bibs = '';
          if (num_pages > 0) {
            log_event(0, 'About to read index pages', null, null, null, "num_pages=" + num_pages);
          }
          for (var page = 0; page < num_pages; page++) {
            (function (page) {  // closure to preserve page number within request callback
              url = buildUrl(page);
              log_event(1, 'Loading index page', page, null, url);
              request(url, function (error, response, html) { //abre o request(url
                log_event(1, 'Received index page', page, null, url);
                if (error) {
                  log_event(1, 'Fatal error - could not read index page', page, null, url, error);
                }
                else { // We have a search page, containing a list of items, each of which we need to inspect  
                  var $ = cheerio.load(html);
                  var elements = $('#results-list li .title');
                  log_event(1, 'Element count', page, null, url, elements.length);
                  elements.each(function (i, elm) { // another closure, this time to isolate i, the index within the page.
                    url = 'https://link.springer.com' + $(this).attr('href');
                    log_event(2, 'Loading result page', page, i, url);
                    request(url, function (error, response, html) {
                      log_event(2, 'Received result page', page, i, url);
                      if (!error) {
                        var $ = cheerio.load(html);
                        var cite_links = $('a.gtm-export-citation[data-gtmlabel="BIB"]').first();
                        if (cite_links.length > 0) {
                          cite_links.filter(function () {
                            var data = $(this);
                            url = 'https:' + data.attr('href');
                            log_event(3, 'Loading citation info', page, i, url);
                            request(url, function (error, response, text) {
                              log_event(3, 'Received citation info', page, i, url);
                              if (!error) {
                                num_citations++;
                                bibs += text; // text.replace('\n', '\r\n');
                                log_event(4, 'Saved citation', page, i, url, num_citations, num_empty, num_failures);
                              }
                              else {
                                num_failures++;
                                log_event(4, 'Error loading citation', page, i, url, num_citations, num_empty, num_failures);
                              }
                              finishIfReady();
                            });
                          });
                        }
                        else {
                          num_empty++;
                          log_event(3, 'No citation link', page, i, url, num_citations, num_empty, num_failures);
                          finishIfReady();
                        }
                      }
                      else {
                        log_event(2, 'Error on result page', page, i, url, error);
                        num_failures++;
                        finishIfReady();
                      }
                    })
                  })
                } // Inspect a serach result page
              }) // End of request for a search result page (perhaps with error)

            })(page); // Closure for page
          }
        }());
      }) // Request the main page: end of call-back
    } // end of execute()
  }; // end of Module return value
} // end of Module
