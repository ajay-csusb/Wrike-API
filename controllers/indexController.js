var express = require('express')
,request = require('request')
,async = require('async')
,token = 'WF3CJdNr9VJjz6t69tHsxUlJpcGMGaBezlukvEX0fEJ5UnVroZm6EfL5WKi0LirE-N-WFIUK'
,hostname = 'http://www.wrike.com/api/v3'
,parseJson = require('json-parse-better-errors')
,jsonResult = []
,jsonResStr = ''
,fields = {}
,projects = {}
,users = {};

// Router for /home page.
home = function(req, res) {
  res.send('HTTP code 200');
};

// Wrapper for HTTP GET.
function wrikeHttpGet(arg, callback) {
  var foldersJson = [];
  var individualProjectData = '';
  request.get(hostname + '/folders/' + arg, {
      'auth': {
        'bearer': token
      },
    'content-type': 'application/json',
    }, function(err, resp) {
    if (err) {
      console.log(err);
      throw err;
    }
    try {
      parseJson(resp.body);
      foldersJson = JSON.parse(resp.body);
      individualProjectData = parseProjects(foldersJson, null);
      jsonResult.push(individualProjectData);
    } catch (e) {
      console.log(e);
      throw e;
    }
    callback(null, individualProjectData);
  });
}

// Get projects/folders from Wrike.
getProjects = function(req, res, error) {
  request.get(hostname + '/folders', {
    'auth': {
      'bearer': token
    }
  }, function (error, response, body) {
    if (error) {
      res.sendStatus(500);
      return console.log(new Date() + ' => Error encountered during API response:', error);
    }
    getFolders(body, res)
    .then(function (value) {
      // @Todo flatten the array before displaying it.
      res.json(value);
    });
    getFields(getFieldsKeyValue);
    getUsers(getUsersKeyValue);
  });
};

// Parse project data received from Wrike.
function getFolders(data, res) {
  var projectIds = new Array()
    ,pidBucket = []
    ,noOfProjectArrays = 0
    ,projectIdsString = null
    ,wrikeJsonData = null
    ,chunks = []
    ,jsonResult = new Array();

  try {
    parseJson(JSON.stringify(data));
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
  } catch(e) {
    console.log(e);
    throw e;
  }

  projectIds = getProjectIds(data);
  projectIdsString = projectIds.join();
  noOfProjectArrays = Math.ceil(projectIds.length/100);
  pidBucket = splitProjectIdsIntoHundredItemsPerArrayElement(noOfProjectArrays, projectIds);

  return new Promise(function(resolve, reject) {
    async.map(pidBucket, wrikeHttpGet, function (err, result) {
      if (err) {
        console.log("Promise error => " + err);
        reject(err);
      }
      resolve(result);
    });
  });
};

// Only 100 project ids can be used as arguments to the Wrike API in one request.
// Since we have more than 100 project ids, we create an array where each element has
// 100 project ids separated by ','.
function splitProjectIdsIntoHundredItemsPerArrayElement(noOfProjectArrays, projectIds) {
  var pidBucket = []
    ,lastCount = 0
    ,count = 0;
  for (var i = 0; i < noOfProjectArrays; i++) {
    count = 100+lastCount;
    var str = '';
    for (var j = lastCount; j < count; j++) {
      if (typeof projectIds[j] != 'undefined') {
        str += projectIds[j] + ",";
        lastCount = j;
      }
    }
    pidBucket[i] = str;
  }
  return pidBucket;
}

// Return project ids from json.
function getProjectIds(data) {
  var children
    ,projectIds = new Array();
  //data = JSON.stringify(data);

  try {
    parseJson(JSON.stringify(data));
    //data = JSON.parse(data);
  } catch (err) {
    console.log(err);
    throw err;
  }

  if (data && data.data){
    data.data.forEach(function(value) {
      children = value.childIds;
      if (children.length != 0) {
        children.forEach(function(child) {
          projectIds.push(child);
        });
      }
    });
  }
  return projectIds;
}

// Get custom fields and their id.
function getFields(callback) {
  var jsonResult = [];
  request.get(hostname + '/customfields', {
      'auth': {
        'bearer': token
      }
    })
    .on('error', function(error) {
      console.log("An error occured during HTTP GET." + error);
    })
    .on('data', function(data) {
      jsonResult.push(data);
    })
    .on('end', function() {
      customFields = jsonResult;
      //callback(getFieldsKeyValue(jsonResult.toString()));
      callback(jsonResult.toString());
      //getFieldsKeyValue(jsonResult.toString());
    });
}

function getFieldsKeyValue(fields) {
  var jsonData = null;
  try {
    jsonData = JSON.parse(fields);
  } catch(e) {
    console.log(e);
    jsonData = fields;
  }
  if (jsonData != null && jsonData.data != null) {
    jsonData.data.forEach(function (value) {
      fields[value.id] = value.title.replace(/ /g, '');
    });
  } else {
    return null;
  }
  return fields;
  // @Todo Understanding callbacks
  // https://github.com/maxogden/art-of-node#callbacks

  // @Todo Test JSON fake data using
  // https://jsonplaceholder.typicode.com/

  // @Todo Fake JSON data
  //https://github.com/marak/Faker.js/

  // @Todo JSON schema faker
  // https://github.com/json-schema-faker/json-schema-faker
}

// Get user information.
// @Todo test this.
function getUsers(callback) {
  var jsonResult = [];
  request.get(hostname + '/contacts', {
      'auth': {
        'bearer': token
      },
  })
  .on('error', function(error) {
    console.log("An error occured during HTTP GET.");
  })
  .on('data', function(data) {
    jsonResult.push(data);
  })
  .on('end', function() {
    //callback(getUsersKeyValue(jsonResult.toString()));
    callback(jsonResult.toString());
    //getUsersKeyValue(jsonResult.toString());
  });
}

// Store relevant User information in key => value format.
// @Todo test this.
function getUsersKeyValue(userData) {
  var jsonData = null;
  try {
    jsonData = JSON.parse(userData);
  } catch(e) {
    console.log(e);
    jsonData = userData;
  }
  if (jsonData != null && jsonData.data != null) {
    jsonData.data.forEach(function (value) {
      // Store it in the form foo[userid] => "First Last Name"
      users[value.id] = value.firstName  + " " + value.lastName;
    });
  } else {
    return null;
  }
  return users;
};

// @Todo test this.
function parseProjects(data, res) {
  var jsonData = null
    ,jsonId
    ,jsonTitle
    ,jsonStatus
    ,jsonPermaLink
    ,jsonCompletedDate
    ,jsonResult = new Array();

  try {
    parseJson(JSON.stringify(data));
    jsonData = data;
  } catch(e) {
    console.log(e);
    throw e;
  }

  if (jsonData){
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
  getProjects: getProjects,
  parseProjects: parseProjects,
  getProjectIds: getProjectIds,
  wrikeHttpGet: wrikeHttpGet,
  getFields : getFields,
  getFieldsKeyValue: getFieldsKeyValue,
  getUsers: getUsers,
  getUsersKeyValue: getUsersKeyValue,
  getFolders: getFolders,
  splitProjectIdsIntoHundredItemsPerArrayElement: splitProjectIdsIntoHundredItemsPerArrayElement,
  hostname: hostname,
  token: token
};
