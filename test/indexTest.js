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
  it('Test homepage', function (done) {
    supertest(app)
      .get('/')
      .expect(200, done)
  })

  it('Test getFolders() function', function (done) {
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

  it('Test splitProjectIdsIntoHundredItemsPerArrayElement() function', function () {
    var projectIds = index.getProjectIds(foldersJson)
    var noOfProjectArrays = Math.ceil(projectIds.length / 100)

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

  it('Test getProjectIds function', function () {
    // Test for 1 project Id.
    var json = {
      'data': [{
        'id': 1,
        'title': 'bar',
        'childIds': []
      }]
    }
    var data = []
    data.push(json)
    var result = index.getProjectIds(json)
    result.should.be.a('Array')
    result.should.have.lengthOf(0)

    // Test for multiple project Id.
    json = {
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
    data = []
    data.push(json)
    result = index.getProjectIds(json)
    result.should.be.a('Array')
    result.should.have.lengthOf(4)

    // Test for no project Id.
    json = {
      'data': [{
        'id': 1,
        'title': 'bar'
      }]
    }
    data = []
    data.push(json)
    result = index.getProjectIds(json)
    result.should.be.a('Array')
    result.should.have.lengthOf(0)

    // Test for incorrect data format
    json = {
      'foo': [{
        'id': 1,
        'title': 'bar'
      }]
    }
    data = []
    data.push(json)
    result = index.getProjectIds(json)
    result.should.be.a('Array')
    result.should.have.lengthOf(0)
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

  it('Test getFields() function', function (done) {
    // @Todo test for 500 errors.
    // Check right argument is passed to callback.
    index.getFields(function (res) {
      var expected = JSON.stringify(fieldsJson)
      assert.equal(res, expected)
      done()
    })
  })

  it('Test getFieldsKeyValue() function', function () {
    // Assert correct key value pair exists.
    var result = index.getFieldsKeyValue(fieldsJson)
    assert.equal(result.IEAAVFCRJUAADIXA, 'IncludeinALLITSProjects')
    assert.isObject(result)
    assert.notEqual(Object.keys(result).length, 0)

    // If 'null' is passed as argument.
    result = index.getFieldsKeyValue(null)
    assert.isNull(result)

    // Incorrect data structure passed as argument.
    var arr = []
    arr.push('a')
    arr.push('b')
    arr.push('c')
    result = index.getFieldsKeyValue(arr)
    assert.isNull(result)

    // Assert Errors are thrown.
    assert.throws(function () {
      index.getFieldsKeyValue('')
    }, Error)
  })

  it('Test getUsers() function', function (done) {
    // @Todo test for 500 errors.
    // Check right argument is passed to callback.
    index.getUsers(function (res) {
      var userData = JSON.stringify(contactsJson)
      assert.equal(res, userData)
      done()
    }, done)
  })

  it('Test getUsersKeyValue() function', function () {
    // Assert correct key value pair exists.
    var result = index.getUsersKeyValue(contactsJson)
    assert.equal(result.KUABNSLV, 'Michael Casadonte')
    assert.isObject(result)
    assert.notEqual(Object.keys(result).length, 0)

    // If 'null' is passed as argument.
    result = index.getUsersKeyValue(null)
    assert.isNull(result)

    // Incorrect data structure passed as argument.
    var arr = []
    arr.push('a')
    arr.push('b')
    arr.push('c')
    result = index.getUsersKeyValue(arr)
    assert.isNull(result)

    // Assert Errors are thrown.
    assert.throws(function () {
      index.getUsersKeyValue('')
    }, Error)
  })

  it('Test parseProject function', function () {
    index.getFieldsKeyValue(fieldsJson)
    index.getUsersKeyValue(contactsJson)
    // If 'null' is passed as an argument.
    var result = index.parseProjects(null)
    result.should.be.an('array')
    result.should.have.lengthOf(0)

    // @Todo add another data item, tests are returning false positives. E.g PAWS.
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
            'id': 'IEAAVFCRJUAACZZF',
            'value': 'foo'
          },
          {
            'id': 'IEAAVFCRJUAAC4KN',
            'value': 'bar'
          },
          {
            'id': 'IEAAVFCRJUAADIXA',
            'value': 'baz'
          },
          {
            'id': 'IEAAVFCRJUAADNPU',
            'value': 'buzz'
          },
          {
            'id': 'IEAAVFCRJUAACEBT',
            'value': 'KUABNOLM'
          }
        ],
        'project': {
          'authorId': 'KUABMKIC',
          'ownerIds': ['KUABMKIC', 'KUABNSLV'],
          'status': 'Green',
          'startDate': '2015-08-26',
          'endDate': '2015-11-17',
          'createdDate': '2016-06-17T19:25:58Z'
        }
      }]
    }

    result = index.parseProjects(json)
    result.should.be.a('array')
    result.should.have.lengthOf(1)

    assert.equal(result[0].id, 1)
    assert.equal(result[0].title, 'bar')
    assert.equal(result[0].status, 'incomplete')
    assert.equal(result[0].permalink, 'http://www.example.com')
    assert.equal(result[0].completedDate, '12/20/2020')
    assert.isDefined(result[0].project)
    assert.isDefined(result[0].customFields)
    assert.equal(result[0].customFields.Category, 'foo')
    assert.equal(result[0].customFields.Percentcomplete, 'bar')
    assert.equal(result[0].customFields.IncludeinALLITSProjects, 'baz')
    assert.equal(result[0].customFields.ProjectSummary, 'buzz')
    assert.equal(result[0].customFields.ProjectMPP, 'Jim Olinger')
    assert.equal(result[0].project.authorName, 'Felix Zuniga')
    assert.deepEqual(result[0].project.ownerNames, ['Felix Zuniga', 'Michael Casadonte'])
  })

  it('Test setUserNameCorrespondingToUserId function', function () {
    index.getUsersKeyValue(contactsJson)
    // Single user id.
    var projectData = { authorId: 'KUABMKIC',
      ownerIds: [ 'KUABNOLM' ],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    var result = index.setUserNameCorrespondingToUserId(projectData)
    assert.equal(result, 'Jim Olinger')

    // Multiple user id.
    projectData = { authorId: 'KUABMKIC',
      ownerIds: ['KUABNOLM', 'KUAB3MAU', 'KX76FPT4'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    result = index.setUserNameCorrespondingToUserId(projectData)
    assert.deepEqual(result, ['Jim Olinger', 'William Yates', 'Web Development '])

    // Empty user id.
    projectData = { authorId: 'KUABMKIC',
      ownerIds: [],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    result = index.setUserNameCorrespondingToUserId(projectData)
    assert.deepEqual(result, [])

    // Invalid user id.
    projectData = { authorId: 'KUABMKIC',
      ownerIds: ['foo'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    result = index.setUserNameCorrespondingToUserId(projectData)
    assert.deepEqual(result, [])
  })

  it('Test setAuthorNameCorrespondingToAuthorId function', function () {
    index.getUsersKeyValue(contactsJson)
    // Single author id.
    var projectData = { authorId: 'KUABMKIC',
      ownerIds: [ 'KUABNOLM' ],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    var result = index.setAuthorNameCorrespondingToAuthorId(projectData)
    assert.equal(result, 'Felix Zuniga')

    // Empty author id.
    projectData = { authorId: '',
      ownerIds: [],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    result = index.setAuthorNameCorrespondingToAuthorId(projectData)
    assert.deepEqual(result, [])

    // Invalid user id.
    projectData = { authorId: 'foo',
      ownerIds: ['foo'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    result = index.setAuthorNameCorrespondingToAuthorId(projectData)
    assert.deepEqual(result, [])

    // undefined author id.
    projectData = {
      ownerIds: ['KUABMKIC'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z'
    }
    result = index.setAuthorNameCorrespondingToAuthorId(projectData)
    assert.deepEqual(result, [])
  })

  it('Test setCustomFieldsKeyValue function', function () {
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
})
