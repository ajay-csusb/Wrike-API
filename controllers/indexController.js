var express = require('express'),
  request = require('request'),
  async = require('async'),
  token = 'WF3CJdNr9VJjz6t69tHsxUlJpcGMGaBezlukvEX0fEJ5UnVroZm6EfL5WKi0LirE-N-WFIUK',
  hostname = 'http://www.wrike.com/api/v3',
  parseJson = require('json-parse-better-errors'),
  jsonResult = [],
  jsonResStr = '',
  fields = {},
  projects = {},
  users = {}

// Router for /home page.
home = function (req, res) {
  res.send('HTTP code 200')
}

// Get projects/folders from Wrike.
// @Todo test this.
getProjects = function (req, res, error) {
  var result = {}
  request.get(hostname + '/folders', {
    'auth': {
      'bearer': token
    }
  }, function (error, response, body) {
    if (error) {
      res.sendStatus(500)
      return console.log(new Date() + ' => Error encountered during API response:', error)
    }
    getFolders(body)
    .then(function (value) {
      // Necessary to append a key "WrikeProjects" for Drupal to parse the result.
      result.WrikeProjects = value
      res.json(result)
    })
    getFields(getFieldsKeyValue)
    getUsers(getUsersKeyValue)
  })
}

// Parse project data received from Wrike.
// @Todo test for duplicate items.
function getFolders (data) {
  var projectIds = {};
  var pidBucket = {};
  var noOfProjectArrays = 0;
  var jsonData = null;

  jsonData = getJson(data)
  projectIds = getProjectIds(jsonData)
  if (typeof projectIds !== 'undefined' && projectIds.length !== 0) {
    noOfProjectArrays = Math.ceil(projectIds.length/100)
    pidBucket = splitProjectIdsIntoHundredItemsPerArrayElement(noOfProjectArrays, projectIds)
  }

  return new Promise(function (resolve, reject) {
    async.map(pidBucket, wrikeHttpGet, function (err, result) {
      if (err) {
        console.log('Promise error => ' + err)
        reject(err)
      }
      // Flatten array.
      var concatResult = [].concat.apply([], result)
      resolve(concatResult)
    })
  })
};

// Only 100 project ids can be used as arguments to the Wrike API in one request.
// Since we have more than 100 project ids, we create an array where each element has
// 100 project ids separated by ','.
function splitProjectIdsIntoHundredItemsPerArrayElement (noOfProjectArrays, projectIds) {
  var pidBucket = [];
  var  lastCount = 0;
  var  count = 0;
  // Create an array where each element contains a string of at most hundred project id's separated by commas.
  for (var i = 0; i < noOfProjectArrays; i++) {
    count = 100 + lastCount
    var str = ''
    var sliceStr = ''
    for (var j = lastCount; j < count; j++) {
      // If current index contains a project Id.
      if (typeof projectIds[j] !== 'undefined') {
        // If the next index contains a project id, add a comma (,).
        // test if j+1 >= count. The current check will pass for all
        // except for the last element in projectIds.
        if (typeof projectIds[j + 1] !== 'undefined') {
          str += projectIds[j] + ','
        }
        else { // last element.
          str += projectIds[j]
        }
        lastCount = j
      }
    }
    // Strip out trailing comma (,) if it exists.
    if (str.charAt(str.length - 1) == ',') {
      sliceStr = str.slice(0, str.length - 1)
    }
    pidBucket[i] = (sliceStr.length != 0) ? sliceStr : str
  }
  return pidBucket
}

// Return project ids from JSON.
function getProjectIds (data) {
  var children,
    projectIds = new Array()

  data = getJson(data)
  if (data && data.data) {
    data.data.forEach(function (value) {
      children = value.childIds
      if (children.length != 0) {
        children.forEach(function (child) {
          projectIds.push(child)
        })
      }
    })
  }
  return projectIds
}

// Get custom fields and their id.
function getFields (callback) {
  var jsonResult = []
  request.get(hostname + '/customfields', {
    'auth': {
      'bearer': token
    }
  }, function (error, response, body) {
    if (error) {
      res.sendStatus(500)
      return console.log(new Date() + ' => Error encountered during API response:', error)
    }
    callback(body)
  })
}

// Return fields in the form {'field_id' : 'Field Name', ...}.
// 'Field Name' is stripped of all empty spaces -  this is done to make it easier to
// parse JSON when the data is received by Drupal.
function getFieldsKeyValue (jsonResponse) {
  var jsonData = null
  jsonData = getJson(jsonResponse)
  if (jsonData != null && jsonData.data != null) {
    jsonData.data.forEach(function (value) {
      fields[value.id] = value.title.replace(/ /g, '')
    })
  } else {
    return null
  }
  return fields
}

// Get user information.
// @Todo test this.
function getUsers (callback) {
  var jsonResult = []
  request.get(hostname + '/contacts', {
    'auth': {
      'bearer': token
    }
  }, function (error, response, body) {
    if (error) {
      res.sendStatus(500)
      return console.log(new Date() + ' => Error encountered during API response:', error)
    }
    callback(body)
  })
}

// Store relevant User information in key => value format.
// @Todo test this.
function getUsersKeyValue (userData) {
  var jsonData = null
  jsonData = getJson(userData)
  if (jsonData != null && jsonData.data != null) {
    jsonData.data.forEach(function (value) {
      // Store it in the form foo[userid] => "First Last Name"
      users[value.id] = value.firstName + ' ' + value.lastName
    })
  } else {
    return null
  }
  return users
};

// @Todo test this.
function parseProjects (data, res) {
  var jsonData = null,
    jsonId,
    jsonTitle,
    jsonStatus,
    jsonPermaLink,
    jsonCompletedDate,
   jsonProject = {},
    customFields,
    customFieldsCurrent = {},
    customFieldsWrapper = new Array(),
    jsonResult = new Array();
    jsonProject.ownerNames = {};
    jsonProject.authorName = {};

  jsonData = getJson(data)

  if (jsonData) {
    jsonData.data.forEach(function (value) {
      jsonId = (value.id !== undefined) ? value.id : ''
      jsonTitle = (value.title !== undefined) ? value.title : ''
      jsonStatus = (value.status !== undefined) ? value.status : ''
      jsonPermaLink = (value.permalink !== undefined) ? value.permalink : ''
      jsonCompletedDate = (value.completedDate !== undefined) ? value.completedDate : ''
      jsonProject = (value.project !== undefined) ? value.project : ''
      // Set a field "ownerNames".
      jsonProject.ownerNames = setUserNameCorrespondingToUserId(jsonProject);
      jsonProject.authorName = setAuthorNameCorrespondingToAuthorId(jsonProject);
      // Replace 'customField' 'id' with value from 'fields' variable.
      // This value is fields.title
      if (typeof value !== 'undefined' && typeof value.customFields !== 'undefined' && value.customFields.length != 0) {
        value.customFields.forEach(function (fieldValue) {
          // Replace each 'Custom Field' ID with its appropriate value from 'fields' variable.
          var res = setCustomFieldsKeyValue(fieldValue.id, fieldValue.value)
          customFieldsCurrent[res.key] = res.value
          // customFieldsCurrent[fields[fieldValue.id]] = fieldValue.value
        })
      }
      jsonResult.push({id: jsonId, customFields: customFieldsCurrent, project: jsonProject, title: jsonTitle, status: jsonStatus, permalink: jsonPermaLink, completedDate: jsonCompletedDate})
    })
  }
  return jsonResult
}

// Get user name from "ownerId".
function setUserNameCorrespondingToUserId(projectData) {
  var userName = [];
  if (typeof projectData.ownerIds !== 'undefined') {
    projectData.ownerIds.forEach(function(value) {
      if (users[value] !== undefined) {
        userName.push(users[value])
      }
    });
  }
  return userName
}

// Get author name from "authorId".
function setAuthorNameCorrespondingToAuthorId(projectData) {
  var authorName = [];
  if (typeof projectData.authorId !== 'undefined') {
    if (users[projectData.authorId] !== undefined) {
      authorName.push(users[projectData.authorId])
    }
  }
  return authorName
}

// Get value for field "ProjectMPP" and other fields.
function setCustomFieldsKeyValue (fieldKey, fieldValue) {
  var result = {}
  if (fields[fieldKey] == 'ProjectMPP') {
    result.key = fields[fieldKey]
    result.value = users[fieldValue]
    return result
  }
  result.key = fields[fieldKey]
  result.value = fieldValue
  return result
}

// Validate JSON format. Return a JSON object. If JSON format is not valid throw error.
function getJson (json) {
  var result = json
  try {
    parseJson(JSON.stringify(json))
    if (typeof json === 'string') {
      result = JSON.parse(json)
    }
  } catch (e) {
    throw e
  }
  return result
}

// Wrapper for HTTP GET.
function wrikeHttpGet (arg, callback) {
  var foldersJson = []
  var individualProjectData = ''
  request.get(hostname + '/folders/' + arg, {
    'auth': {
      'bearer': token
    },
    'content-type': 'application/json'
  }, function (err, resp) {
    if (err) {
      console.log(err)
      throw err
    }
    foldersJson = getJson(resp.body)
    individualProjectData = parseProjects(foldersJson, null)
    // jsonResult.push(individualProjectData)
    callback(null, individualProjectData)
  })
}

module.exports = {
  home: home,
  getProjects: getProjects,
  parseProjects: parseProjects,
  getProjectIds: getProjectIds,
  wrikeHttpGet: wrikeHttpGet,
  getFields: getFields,
  getFieldsKeyValue: getFieldsKeyValue,
  getUsers: getUsers,
  getUsersKeyValue: getUsersKeyValue,
  getFolders: getFolders,
  splitProjectIdsIntoHundredItemsPerArrayElement: splitProjectIdsIntoHundredItemsPerArrayElement,
  setCustomFieldsKeyValue: setCustomFieldsKeyValue,
  setUserNameCorrespondingToUserId: setUserNameCorrespondingToUserId,
  setAuthorNameCorrespondingToAuthorId: setAuthorNameCorrespondingToAuthorId,
  fields: fields,
  hostname: hostname,
  token: token
}
