var express = require('express')
,request = require('request')
,token = 'WF3CJdNr9VJjz6t69tHsxUlJpcGMGaBezlukvEX0fEJ5UnVroZm6EfL5WKi0LirE-N-WFIUK'
,hostname = 'http://www.wrike.com/api/v3/';

home = function(req, res) {
  console.log('Homepage');
  res.send('HTTP code 200');
};

getTasks = function(req, res, error) {
  request.get(hostname + '/tasks', {
    'auth': {
      'bearer': token
    }
  },function (error, response, body) {
    if (error) { return console.log('Error encountered during API response:', error);}
    var jsonResult = parseTasks(body);
    res.json(jsonResult);
  });
};

function parseTasks(data) {
  var jsonData = null
    ,jsonId
    ,jsonTitle
    ,jsonStatus
    ,jsonPermaLink
    ,jsonCompletedDate
    ,jsonResult = new Array();

  try {
    jsonData = JSON.parse(data);
  } catch(e) {
    jsonData = data;
  }

  if (jsonData && jsonData.data){
    jsonData.data.forEach(function(value){
      jsonId = (value.id !== undefined) ? value.id: '';
      jsonTitle = (value.title !== undefined) ? value.title: '';
      jsonStatus = (value.status !== undefined) ? value.status: '';
      jsonPermaLink = (value.permalink !== undefined) ? value.permalink: '';
      jsonCompletedDate = (value.completedDate !== undefined) ? value.completedDate : "";
      jsonResult.push({id: jsonId, title: jsonTitle, status: jsonStatus, permalink: jsonPermaLink, completedDate: jsonCompletedDate});
    });
  }
  return jsonResult;
}

module.exports = {
  home: home,
  getTasks: getTasks,
  parseTasks: parseTasks
};
