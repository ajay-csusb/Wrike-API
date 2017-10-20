var request = require('supertest');
var req = require('request')
var app = require('../app');
var assert = require('assert');
var index = require('../controllers/indexController');
var nock = require('nock');
var superagent = require('superagent');

describe('Wrike API Tests.', function() {
  //this.timeout(15000);
  it('Test homepage', function(done) {
    request(app)
    .get('/')
    .expect(200, done);
  });

  it('Test wrike tasks', function(done) {
    request(app)
    .get('/get/wrike/tasks')
    .expect('Content-Type', /json/)
    .expect(200, done);
  });

  it('Test wrike api responds with auth error', function(done) {
    // Mock URL to simulate authorization error.
    var scope = nock(index.hostname, {
      reqheaders: {
        "authorization": "Bearer " + index.token
      }
    })
    .get('/tasks')
    .replyWithError({'message': 'Authorization error', 'code': '900'});

    request(app)
    .get('/get/wrike/tasks')
    .expect(500)
    .end(function(err, res) {
      if (err) throw done(err);
      done();
    });
  });

  it('Test parseTasks()', function() {
    var data = {
      "kind": "tasks",
    "data":[{
      "id": "IEAGIITRKQAYHYM4",
    "accountId": "IEAGIITR",
    "title": "Test task",
    "description": "",
    "briefDescription": "",
    "parentIds":
    [
    "IEAGIITRI4AYHYMW"
    ],
    "superParentIds":
    [
    ],
    "sharedIds":
    [
    "KUAJ25LD"
    ],
    "responsibleIds":
      [
      ],
    "status": "Active",
    "importance": "Normal",
    "createdDate": "2016-10-03T16:10:41Z",
    "updatedDate": "2016-10-03T16:10:45Z",
    "dates":
    {
      "type": "Planned",
      "duration": 2880,
      "start": "2016-09-29T09:00:00",
      "due": "2016-10-06T17:00:00"
    },
    "scope": "WsTask",
    "authorIds":
      [
      "KUAJ25LD"
      ],
    "customStatusId": "IEAGIITRJMAAAAAA",
    "hasAttachments": false,
    "attachmentCount": 0,
    "permalink": "https://www.wrike.com/open.htm?id=25420188",
    "priority": "19453c0000006c00",
    "superTaskIds":
      [
      ],
    "subTaskIds":
      [
      ],
    "dependencyIds":
      [
      "IEAGIITRIUAYHYM4KMAYHYM5",
    "IEAGIITRIUAYHYM6KMAYHYM4"
      ],
    "metadata":
      [
      {
        "key": "testMetaKey",
        "value": "testMetaValue"
      }
  ],
    "customFields":
      [
      ]
    }],
    };
    var expected = [{ "id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active","permalink":"https://www.wrike.com/open.htm?id=25420188","completedDate":"" }];
    result = index.parseTasks(data);
    assert.deepEqual(result, expected);

    var data1 = {"foo": [{"employee":{ "name":"John", "age":30, "city":"New York" }}]};
    result = index.parseTasks(data1);
    expected = new Array();
    assert.deepEqual(result, expected);

    var data_no_id = {"data" : [{"title":"Test task","status":"Active","permalink":"https://www.wrike.com/open.htm?id=25420188", "completedDate":"2016-04-22T16:28:07Z" }]};
    result = index.parseTasks(data_no_id);
    expected = [{ "id":"","title":"Test task","status":"Active","permalink":"https://www.wrike.com/open.htm?id=25420188","completedDate":"2016-04-22T16:28:07Z" }];
    assert.deepEqual(result, expected);

    var data_no_title = {"data" : [{"id":"IEAGIITRKQAYHYM4","status":"Active","permalink":"https://www.wrike.com/open.htm?id=25420188", "completedDate":"2016-04-22T16:28:07Z" }]};
    result = index.parseTasks(data_no_title);
    expected = [{ "id":"IEAGIITRKQAYHYM4","title":"","status":"Active","permalink":"https://www.wrike.com/open.htm?id=25420188","completedDate":"2016-04-22T16:28:07Z" }];
    assert.deepEqual(result, expected);

    var data_no_status = {"data" : [{"id":"IEAGIITRKQAYHYM4","title":"Test task","permalink":"https://www.wrike.com/open.htm?id=25420188", "completedDate":"2016-04-22T16:28:07Z" }]};
    result = index.parseTasks(data_no_status);
    expected = [{ "id":"IEAGIITRKQAYHYM4","title":"Test task","status":"","permalink":"https://www.wrike.com/open.htm?id=25420188","completedDate":"2016-04-22T16:28:07Z" }];
    assert.deepEqual(result, expected);

    var data_no_link = {"data" : [{"id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active", "completedDate":"2016-04-22T16:28:07Z" }]};
    result = index.parseTasks(data_no_link);
    expected = [{ "id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active","permalink":"","completedDate":"2016-04-22T16:28:07Z" }];
    assert.deepEqual(result, expected);

    var data_no_date = {"data" : [{"id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active", "permalink":"https://www.wrike.com/open.htm?id=25420188"}]};
    result = index.parseTasks(data_no_date);
    expected = [{ "id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active","permalink":"https://www.wrike.com/open.htm?id=25420188","completedDate":"" }];
    assert.deepEqual(result, expected);

    var data_no_link_date = {"data" : [{"id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active"}]};
    result = index.parseTasks(data_no_link_date);
    expected = [{ "id":"IEAGIITRKQAYHYM4","title":"Test task","status":"Active","permalink":"","completedDate":"" }];
    assert.deepEqual(result, expected);

    var empty_data = [];
    result = index.parseTasks(empty_data);
    expected = [];
    assert.deepEqual(result, expected);

    var empty_data_1 = {"data": []};
    result = index.parseTasks(empty_data_1);
    expected = [];
    assert.deepEqual(result, expected);
  });
});
