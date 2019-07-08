const request = require('request');
const async = require('async');

const token = process.env.WRIKE_API_TOKEN;
const hostname = 'http://www.wrike.com/api/v3';
const parseJson = require('json-parse-better-errors');

const fields = {};
const users = {};

// Validate JSON format. Return a JSON object. If JSON format is not valid throw error.
function getJson(json) {
  let result = json;
  try {
    parseJson(JSON.stringify(json));
    if (typeof json === 'string') {
      result = JSON.parse(json);
    }
  } catch (e) {
    throw e;
  }
  return result;
}

// Only 100 project ids can be used as arguments to the Wrike API in one request.
// Since we have more than 100 project ids, we create an array where each element has
// 100 project ids separated by ','.
function splitProjectIdsIntoHundredItemsPerArrayRow(noOfRowsArrays, projectIds) {
  const pidArray = [];
  let lastCount = -1;
  let count = 0;
  // Create an array where each row contains a string of at most hundred
  // project id's separated by commas.
  for (let row = 0; row < noOfRowsArrays; row += 1) {
    count = 100 + lastCount;
    let str = '';
    let sliceStr = '';
    for (let j = lastCount + 1; j < count; j += 1) {
      // If current index contains a project Id.
      if (typeof projectIds[j] !== 'undefined') {
        // If the next index contains a project id, add a comma (,).
        // test if j+1 >= count. The current check will pass for all
        // except for the last element in projectIds.
        if (typeof projectIds[j + 1] !== 'undefined') {
          str += `${projectIds[j]},`;
        } else { // last element.
          str += projectIds[j];
        }
        lastCount = j;
      }
    }
    // Strip out trailing comma (,) if it exists.
    if (str.charAt(str.length - 1) === ',') {
      sliceStr = str.slice(0, str.length - 1);
    }
    pidArray[row] = (sliceStr.length !== 0) ? sliceStr : str;
  }
  return pidArray;
}

// Return project ids from JSON.
function getProjectIds(folderData) {
  let children;
  const projectIds = [];
  const data = getJson(folderData);
  if (data && data.data) {
    data.data.forEach((value) => {
      children = value.childIds;
      if (typeof children !== 'undefined' && children.length !== 0) {
        children.forEach((child) => {
          // If Id is already present do not insert it.
          if (!projectIds.includes(child)) {
            projectIds.push(child);
          }
        });
      }
    });
  }
  return projectIds;
}

// Get user name from "ownerId".
function setUserNameCorrespondingToOwnerId(projectData) {
  const userName = [];
  if (typeof projectData.ownerIds !== 'undefined') {
    projectData.ownerIds.forEach((value) => {
      if (users[value] !== undefined) {
        userName.push(users[value]);
      }
    });
  }
  return userName;
}

// Get author name from "authorId".
function setAuthorNameCorrespondingToAuthorId(projectData) {
  const authorName = [];
  if (typeof projectData.authorId !== 'undefined') {
    if (users[projectData.authorId] !== undefined) {
      authorName.push(users[projectData.authorId]);
    }
  }
  return authorName;
}

// Get value for field "ProjectMPP" and other fields.
function setCustomFieldsKeyValue(fieldKey, fieldValue) {
  const result = {};
  result.value = [];
  if (fields[fieldKey] === 'ProjectMPP') {
    result.key = fields[fieldKey];
    const fieldValueArr = fieldValue.split(',');
    fieldValueArr.forEach((x) => {
      result.value.push(users[x]);
    });
    return result;
  }
  result.key = fields[fieldKey];
  result.value = fieldValue;
  return result;
}

// Build JSON response.
function parseProjects(data) {
  const jsonData = getJson(data);
  let jsonId = null;
  let jsonTitle = null;
  let jsonStatus = null;
  let jsonPermaLink = null;
  let jsonCompletedDate = null;
  let jsonDescription = null;
  let jsonCustomFields = null;
  let jsonProject = {};
  const jsonResult = [];
  jsonProject.ownerNames = {};
  jsonProject.authorName = {};

  if (jsonData) {
    jsonData.data.forEach((value) => {
      const customFieldsCurrent = {};
      jsonId = (value.id !== undefined) ? value.id : '';
      jsonTitle = (value.title !== undefined) ? value.title : '';
      jsonStatus = (value.status !== undefined) ? value.status : '';
      jsonPermaLink = (value.permalink !== undefined) ? value.permalink : '';
      jsonCompletedDate = (value.completedDate !== undefined) ? value.completedDate : '';
      jsonDescription = (value.description !== undefined) ? value.description : '';
      jsonCustomFields = (value.customFields !== undefined) ? value.customFields : '';
      jsonProject = (value.project !== undefined) ? value.project : {};
      // Set a field "ownerNames".
      jsonProject.ownerNames = setUserNameCorrespondingToOwnerId(jsonProject);
      // Set a field "authorName".
      jsonProject.authorName = setAuthorNameCorrespondingToAuthorId(jsonProject);
      // Replace 'customField' 'id' with value from 'fields' variable.
      // This value is fields.title
      if (jsonCustomFields.length !== 0) {
        jsonCustomFields.forEach((fieldValue) => {
          // Replace each 'Custom Field' ID with its appropriate value from 'fields' variable.
          const res = setCustomFieldsKeyValue(fieldValue.id, fieldValue.value);
          customFieldsCurrent[res.key] = res.value;
        });
      }
      jsonResult.push({
        id: jsonId,
        project: jsonProject,
        customFields: customFieldsCurrent,
        title: jsonTitle,
        status: jsonStatus,
        permalink: jsonPermaLink,
        completedDate: jsonCompletedDate,
        description: jsonDescription,
      });
    });
  }
  return jsonResult;
}

// Wrapper for HTTP GET.
function wrikeHttpGet(arg, callback) {
  let projectDetails = [];
  let individualProjectData = '';
  request.get(`${hostname}/folders/${arg}`, {
    auth: {
      bearer: token,
    },
    'content-type': 'application/json',
  }, (err, resp) => {
    if (err) {
      throw err;
    }
    projectDetails = getJson(resp.body);
    individualProjectData = parseProjects(projectDetails, null);
    callback(null, individualProjectData);
  });
}

// Parse project data received from Wrike.
// @Todo test for duplicate items.
function getFolders(data) {
  let projectIds = {};
  let pidArray = {};
  let noOfProjectArrays = 0;
  let jsonData = null;

  jsonData = getJson(data);
  projectIds = getProjectIds(jsonData);

  if (typeof projectIds !== 'undefined' && projectIds.length !== 0) {
    noOfProjectArrays = Math.ceil(projectIds.length / 100);
    pidArray = splitProjectIdsIntoHundredItemsPerArrayRow(noOfProjectArrays, projectIds);
  }
  return new Promise(((resolve, reject) => {
    async.map(pidArray, wrikeHttpGet, (err, result) => {
      if (err) {
        reject(err);
      }
      // Flatten array.
      const concatResult = [].concat.apply([], result);
      resolve(concatResult);
    });
  }));
}

// Get custom fields and their ids.
function getFields(callback, res) {
  request.get(`${hostname}/customfields`, {
    auth: {
      bearer: token,
    },
  }, (error, response, body) => {
    if (error) {
      res.sendStatus(500);
    }
    callback(body);
  });
}

// customFields are in the format
// "customFields": [{"id": "IEAAVFCRJUAACEBT","value": "KUABWUQK"},
// {"id": "IEAAVFCRJUAADNPU","value": "PAWS and MyCAP Upgrade"}],
// Return fields in the form {'field_id' : 'Field Name', ...}.
// 'Field Name' is stripped of all empty spaces -  this is done to make it easier to
// parse JSON when the data is received by Drupal.
function getFieldsKeyValue(jsonResponse) {
  const jsonData = getJson(jsonResponse);
  if (jsonData != null && jsonData.data != null) {
    jsonData.data.forEach((value) => {
      if (value.id !== undefined && value.title !== undefined) {
        fields[value.id] = value.title.replace(/ /g, '');
      }
    });
  } else {
    return null;
  }
  return fields;
}

// Get user information.
function getUsers(callback, res) {
  request.get(`${hostname}/contacts`, {
    auth: {
      bearer: token,
    },
  }, (error, response, body) => {
    if (error) {
      res.sendStatus(500);
    }
    callback(body);
  });
}

// Store relevant User information in key => value format.
function getUsersKeyValue(userData) {
  const jsonData = getJson(userData);
  if (jsonData != null && jsonData.data != null) {
    jsonData.data.forEach((value) => {
      if (value.id !== undefined && value.firstName !== undefined && value.lastName !== undefined) {
        // Store it in the form foo[userid] => "First Last Name"
        users[value.id] = `${value.firstName} ${value.lastName}`;
      }
    });
  } else {
    return null;
  }
  return users;
}

// Router for /home page.
function home(req, res) {
  res.send('HTTP code 200');
}

// Get projects/folders from Wrike.
// @Todo test this.
function getProjects(req, res) {
  const result = {};
  request.get(`${hostname}/folders`, {
    auth: {
      bearer: token,
    },
  }, (error, response, body) => {
    if (error) {
      res.sendStatus(500);
    }
    getFolders(body)
      .then((value) => {
        // Necessary to append a key "WrikeProjects" for Drupal to parse the result.
        result.WrikeProjects = value;
        res.json(result);
      });
    getFields(getFieldsKeyValue, res);
    getUsers(getUsersKeyValue, res);
  });
}

module.exports = {
  home,
  getProjects,
  parseProjects,
  getProjectIds,
  wrikeHttpGet,
  getFields,
  getFieldsKeyValue,
  getUsers,
  getUsersKeyValue,
  getFolders,
  splitProjectIdsIntoHundredItemsPerArrayRow,
  setCustomFieldsKeyValue,
  setUserNameCorrespondingToOwnerId,
  setAuthorNameCorrespondingToAuthorId,
  fields,
  hostname,
  token,
};
