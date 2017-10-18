
/**
 * Module dependencies.
 */

var express = require('express')
  ,routes = require('./routes')
  ,request = require('request')
  ,token = 'WF3CJdNr9VJjz6t69tHsxUlJpcGMGaBezlukvEX0fEJ5UnVroZm6EfL5WKi0LirE-N-WFIUK'
  ,hostname = 'http://www.wrike.com/api/v3/';

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', function(req, res) {
  console.log('Homepage');
  res.send('Homepage');
});

app.get('/get/wrike/tasks', function(req, res) {
  request.get( hostname + '/tasks', {
    'auth': {
      'bearer': token
    }
  },
  function (error, response, body) {
    if (error) { return console.log('Error encountered during API response:', error);}
    parseTasks(body, res);
  });
});


function parseTasks(data, res) {
  var jsonData = JSON.parse(data)
  ,jsonId
  ,jsonTitle
  ,jsonStatus
  ,jsonPermaLink
  ,jsonCompletedDate
  ,jsonResult = new Array();

  jsonData.data.forEach(function(value){
    jsonId = value.id;
    jsonTitle = value.title;
    jsonStatus = value.status;
    jsonPermaLink = value.permalink;
    jsonCompletedDate = value.completedDate;
    jsonResult.push({id: jsonId, title: jsonTitle, status: jsonStatus, permaLink: jsonPermaLink, completedData: jsonCompletedDate});
  });
  //console.log(jsonResult);
  res.json(jsonResult);
}

app.listen(5000, function () {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
