/* eslint-env mocha */
var supertest = require('supertest')
var req = require('request')
var app = require('../app')
var assert = require('assert')
var index = require('../controllers/indexController')
var nock = require('nock')
var superagent = require('superagent')
var should = require('chai').should()
var sinon = require('sinon')
var EventEmitter = require('events').EventEmitter
var assert = require('chai').assert
var passThrough = require('stream').PassThrough
var stream = require('stream')
var foldersJson = require('./folders.json')
var fieldsJson = require('./fields.json')
var contactsJson = require('./contacts.json')
var mockData = require('./mockData.js').mockData()

describe('Wrike API Tests.', function () {
  it.only('Test homepage', function (done) {
    supertest(app)
      .get('/')
      .expect(200, done)
  })

  it.only('Test getFolders() function', function (done) {
    // @Todo test async code https://medium.com/caffeine-and-testing/async-testing-with-mocha-with-callbacks-and-promises-5d0002661b3f
    index.getFolders(foldersJson).then(function (result) {
      assert.equal(18, result.length)
      assert.equal(1, result[0].id)
      assert.equal('sunt aut facere repellat provident occaecati excepturi optio reprehenderit', result[0].title)
      done()
      // @Todo Test for promise reject.
      // Test if splitProjectIdsIntoHundredItemsPerArrayElement() and other functions returns incorrect values.
    })
  })

  it.only('Test splitProjectIdsIntoHundredItemsPerArrayElement() function', function () {
    var projectIds = index.getProjectIds(foldersJson)
    var noOfProjectArrays = Math.ceil(projectIds.length/100)

    var result = index.splitProjectIdsIntoHundredItemsPerArrayElement(noOfProjectArrays, projectIds)
    assert.equal(6, result.length)
    // 100 elements where each element is 16 chars long separated by (,) commas(99).
    assert.equal((100 * 16 + 99), result[0].length)
    assert.equal(53 * 16 + 52, result[5].length)
    assert.isFalse(result[0].endsWith(','), 'No trailing comma found in the first element.')
    assert.isFalse(result[5].endsWith(','), 'No trailing comma found in the last element.')

    var json = {
      'data': [{
        'id': 1,
        'title': 'bar',
        'childIds': [
          'IEAAVFCRI4DTAVJS',
          'IEAAVFCRI4CCTVBL',
          'IEAAVFCRI4CHEO3Q',
          'IEAAVFCRI4CCT5FN'
        ]
      }]
    }
    projectIds = index.getProjectIds(json)
    noOfProjectArrays = projectIds.length / 100
    result = index.splitProjectIdsIntoHundredItemsPerArrayElement(noOfProjectArrays, projectIds)
    assert.equal(1, result.length)
    assert.equal((4 * 16 + 3), result[0].length)
    assert.isFalse(result[0].endsWith(','))
  })

  // it.only('Test wrike projects', function (done) {
  //  supertest(app)
  //    .get('/get/wrike/projects')
  //    .expect('Content-Type', /json/)
  //    .expect(200, done)
  // })
   //
   // it.only('Test wrike api responds with auth error', function (done) {
     // Mock URL to simulate authorization error.
     // nock(index.hostname, {
     // reqheaders: {
     //   "authorization": "Bearer " + index.token
     // }
     // })
     // .get('/get/wrike/projects')
     // .replyWithError({'message': 'Authorization error', 'code': '900'});

     // supertest(app)
     // .get('/get/wrike/projects')
     // .expect(500)
     // .end(function (err, res) {
     //   if (err) throw done(err);
     //   done();
     // });
   // });

  it.only('Test parseProject function', function () {
    var result = index.parseProjects(null)
    result.should.be.an('array')
    result.should.have.lengthOf(0)

    var json = {
      'data': [{
        'id': 1,
        'title': 'bar',
        'status': 'incomplete',
        'permalink': 'http://www.example.com',
        'completedDate': '12/20/2020',
        'childIds': [
          'IEAAVFCRI4DTAVJS',
          'IEAAVFCRI4CCTVBL',
          'IEAAVFCRI4CHEO3Q',
          'IEAAVFCRI4CCT5FN'
        ],
        'customFields': [
          {
            'IEAAVFCRJUAACZZF': 'foo',
            'IEAAVFCRJUAAC4KN': 'buzz'
          },
          {
            'IEAAVFCRJUAADIXA': 'bar',
            'IEAAVFCRJUAADNPU': 'baz'
          }
        ]
      }]
    }

    var result = index.parseProjects(json)
    result.should.be.a('array')
    result.should.have.lengthOf(1)

    assert.equal(result[0].id, 1)
    assert.equal(result[0].title, 'bar')
    assert.equal(result[0].status, 'incomplete')
    assert.equal(result[0].permalink, 'http://www.example.com')
    assert.equal(result[0].completedDate, '12/20/2020')
  })

  it('Test getProjectIds function', function () {
    var json = {
      'data': [{
        'id': 1,
        'title': 'bar',
        'childIds': []
      }]
    }
    var data = new Array()
    data.push(json)
    var result = index.getProjectIds(json)
    result.should.be.a('Array')
    result.should.have.lengthOf(0)

    var json = {
      'data': [{
        'id': 1,
        'title': 'bar',
        'childIds': [
          'IEAAVFCRI4DTAVJS',
          'IEAAVFCRI4CCTVBL',
          'IEAAVFCRI4CHEO3Q',
          'IEAAVFCRI4CCT5FN'
        ]
      }]
    }
    var data = new Array()
    data.push(json)
    var result = index.getProjectIds(json)
    result.should.be.a('Array')
    result.should.have.lengthOf(4)
  })

  it.only('Test getFields() function', function (done) {
    // @Todo test for 500 errors.
    index.getFields(function (res) {
      var expected = JSON.stringify(fieldsJson)
      assert.equal(res, expected)
      done()
    })
  })

  it.only('Test getFieldsKeyValue() function', function () {
    var result = index.getFieldsKeyValue(fieldsJson)
    assert.equal(result.IEAAVFCRJUAADIXA, 'IncludeinALLITSProjects')
    assert.isObject(result)
    assert.notEqual(Object.keys(result).length, 0)

    result = index.getFieldsKeyValue(null)
    assert.isNull(result)

    var arr = []
    arr.push('a')
    arr.push('b')
    arr.push('c')
    result = index.getFieldsKeyValue(arr)
    assert.isNull(result)

    assert.throws(function () {
      index.getFieldsKeyValue('')
    }, Error)
  })

  it.only('Test getUsers() function', function (done) {
    var userData = JSON.stringify(contactsJson)

    index.getUsers(function (res) {
      assert.equal(res, userData)
      done()
    }, done)
  })

  it.only('Test getUsersKeyValue() function', function () {
    var result = index.getUsersKeyValue(contactsJson)
    assert.equal(result.KUABNSLV, 'Michael Casadonte')
    assert.isObject(result)
    assert.notEqual(Object.keys(result).length, 0)

    result = index.getUsersKeyValue(null)
    assert.isNull(result)

    var arr = []
    arr.push('a')
    arr.push('b')
    arr.push('c')
    result = index.getUsersKeyValue(arr)
    assert.isNull(result)

    assert.throws(function () {
      index.getUsersKeyValue('')
    }, Error)
  })

  it.only('Test setCustomFieldsKeyValue function', function () {
    index.getFieldsKeyValue(fieldsJson)
    index.getUsersKeyValue(contactsJson)
    var result = index.setCustomFieldsKeyValue('IEAAVFCRJUAACEBT', 'KUABUZ2V')
    assert.equal(result.key, 'ProjectMPP')
    assert.equal(result.value, 'Khalil Daneshvar')

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAADIXA', 'foo')
    assert.equal(result.key, 'IncludeinALLITSProjects')
    assert.equal(result.value, 'foo')

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAADNPU', 'buzz')
    assert.equal(result.key, 'ProjectSummary')
    assert.equal(result.value, 'buzz')

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAACZZF', 'bar')
    assert.equal(result.key, 'Category')
    assert.equal(result.value, 'bar')

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAAC4KN', 'baz')
    assert.equal(result.key, 'Percentcomplete')
    assert.equal(result.value, 'baz')
  })


  it.only('Test setUserNameCorrespondingToUserId function', function () {
    index.getUsersKeyValue(contactsJson)
    // Single user id.
    var projectData = { authorId: 'KUABMKIC',
      ownerIds: [ 'KUABNOLM' ],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    var result = index.setUserNameCorrespondingToUserId(projectData);
    assert.equal(result, "Jim Olinger");

    // Multiple user id.
    projectData = { authorId: 'KUABMKIC',
      ownerIds: ['KUABNOLM', 'KUAB3MAU', 'KX76FPT4'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setUserNameCorrespondingToUserId(projectData);
    assert.deepEqual(result, ["Jim Olinger", "William Yates", "Web Development "]);

    // Empty user id.
    projectData = { authorId: 'KUABMKIC',
      ownerIds: [],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setUserNameCorrespondingToUserId(projectData);
    assert.deepEqual(result, []);

    // Invalid user id.
    projectData = { authorId: 'KUABMKIC',
      ownerIds: ["foo"],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setUserNameCorrespondingToUserId(projectData);
    assert.deepEqual(result, []);

    // undefined user id.
    projectData = { authorId: 'KUABMKIC',
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setUserNameCorrespondingToUserId(projectData);
    assert.deepEqual(result, []);
  })

  it.only('Test setAuthorNameCorrespondingToAuthorId function', function () {
    index.getUsersKeyValue(contactsJson)
    // Single author id.
    var projectData = { authorId: 'KUABMKIC',
      ownerIds: [ 'KUABNOLM' ],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    var result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.equal(result, "Felix Zuniga");

    // Empty author id.
    projectData = { authorId: '',
      ownerIds: [],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);

    // Invalid user id.
    projectData = { authorId: 'foo',
      ownerIds: ["foo"],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);

    // undefined author id.
    projectData = {
      ownerIds: ['KUABMKIC'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    };
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);
  })
})
