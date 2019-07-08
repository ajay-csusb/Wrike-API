/* eslint-env mocha */
const request = require('supertest');
const app = require('../app');
const index = require('../controllers/indexController');
const should = require('chai').should();
const assert = require('chai').assert;
const foldersJson = require('./folders.json');
const fieldsJson = require('./fields.json');
const contactsJson = require('./contacts.json');
const mockData = require('./mockData.js').mockData();

describe('Wrike API Tests.', () => {
  it('Test homepage', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('Test wrike projects', (done) => {
    request(app)
      .get('/get/wrike/projects')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        assert.isDefined(res.body.WrikeProjects);
        assert.isDefined(res.body.WrikeProjects[0].id);
        assert.isDefined(res.body.WrikeProjects[0].project);
        assert.isDefined(res.body.WrikeProjects[0].customFields);
        assert.isDefined(res.body.WrikeProjects[0].title);
        assert.isDefined(res.body.WrikeProjects[0].status);
        assert.isDefined(res.body.WrikeProjects[0].permalink);
        assert.isDefined(res.body.WrikeProjects[0].completedDate);
        done();
      });
  });

  it('Test getFolders() function', (done) => {
    // @Todo test async code https://medium.com/caffeine-and-testing/async-testing-with-mocha-with-callbacks-and-promises-5d0002661b3f
    index.getFolders(foldersJson).then((result) => {
      assert.equal(18, result.length);
      assert.equal(1, result[0].id);
      assert.equal('sunt aut facere repellat provident occaecati excepturi optio reprehenderit', result[0].title);
      done();
      // @Todo Test for promise reject.
      // Test if splitProjectIdsIntoHundredItemsPerArrayElement() and other functions
      // returns incorrect values.
    });
  });

  it('Test splitProjectIdsIntoHundredItemsPerArrayRow() function', () => {
    let projectIds = index.getProjectIds(foldersJson);
    let noOfProjectArrays = Math.ceil(projectIds.length / 100);

    let result = index.splitProjectIdsIntoHundredItemsPerArrayRow(noOfProjectArrays, projectIds);
    assert.equal(6, result.length);
    // Mock folders.json file contains 548 folder details. 29 of them are duplicates.
    // 100 elements where each element is 16 chars long separated by (,) commas(99).
    assert.equal(((99 * 16) + 98), result[0].length);
    assert.equal((12 * 16) + 11, result[5].length)
    assert.isFalse(result[0].endsWith(','), 'No trailing comma found in the first element.');
    assert.isFalse(result[5].endsWith(','), 'No trailing comma found in the last element.');

    const json = {
      data: [{
        id: 1,
        title: 'bar',
        childIds: [
          'IEAAVFCRI4DTAVJS',
          'IEAAVFCRI4CCTVBL',
          'IEAAVFCRI4CHEO3Q',
          'IEAAVFCRI4CCT5FN',
        ],
      }],
    };
    projectIds = index.getProjectIds(json);
    noOfProjectArrays = projectIds.length / 100;
    result = index.splitProjectIdsIntoHundredItemsPerArrayRow(noOfProjectArrays, projectIds);
    assert.equal(1, result.length);
    assert.equal(((4 * 16) + 3), result[0].length);
    assert.isFalse(result[0].endsWith(','));
  });

  it('Test getProjectIds function', () => {
    // Test for 1 project Id.
    let json = {
      data: [{
        id: 1,
        title: 'bar',
        childIds: [],
      }],
    };
    let data = [];
    data.push(json);
    let result = index.getProjectIds(json);
    result.should.be.a('Array');
    result.should.have.lengthOf(0);

    // Test for multiple project Id.
    json = {
      data: [{
        id: 1,
        title: 'bar',
        childIds: [
          'IEAAVFCRI4DTAVJS',
          'IEAAVFCRI4CCTVBL',
          'IEAAVFCRI4CHEO3Q',
          'IEAAVFCRI4CCT5FN',
        ],
      }],
    };
    data = [];
    data.push(json);
    result = index.getProjectIds(json);
    result.should.be.a('Array');
    result.should.have.lengthOf(4);

    // Test for no project Id.
    json = {
      data: [{
        id: 1,
        title: 'bar',
      }],
    };
    data = [];
    data.push(json);
    result = index.getProjectIds(json);
    result.should.be.a('Array');
    result.should.have.lengthOf(0);

    // Test for incorrect data format
    json = {
      foo: [{
        id: 1,
        title: 'bar',
      }],
    };
    data = [];
    data.push(json);
    result = index.getProjectIds(json);
    result.should.be.a('Array');
    result.should.have.lengthOf(0);
  });

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

  it('Test getFields() function', (done) => {
    // @Todo test for 500 errors.
    // Check right argument is passed to callback.
    index.getFields((res) => {
      const expected = JSON.stringify(fieldsJson);
      assert.equal(res, expected);
      done();
    });
  });

  it('Test getFieldsKeyValue() function', () => {
    // Assert correct key value pair exists.
    let result = index.getFieldsKeyValue(fieldsJson);
    assert.equal(result.IEAAVFCRJUAADIXA, 'IncludeinALLITSProjects');
    assert.isObject(result);
    assert.notEqual(Object.keys(result).length, 0);

    // If 'null' is passed as argument.
    result = index.getFieldsKeyValue(null);
    assert.isNull(result);

    // Incorrect data structure passed as argument.
    const arr = [];
    arr.push('a');
    arr.push('b');
    arr.push('c');
    result = index.getFieldsKeyValue(arr);
    assert.isNull(result);

    // Assert Errors are thrown.
    assert.throws(() => {
      index.getFieldsKeyValue('');
    }, Error);
  });

  it('Test getUsers() function', (done) => {
    // @Todo test for 500 errors.
    // Check right argument is passed to callback.
    index.getUsers((res) => {
      const userData = JSON.stringify(contactsJson);
      assert.equal(res, userData);
      done();
    }, done);
  });

  it('Test getUsersKeyValue() function', () => {
    // Assert correct key value pair exists.
    let result = index.getUsersKeyValue(contactsJson);
    assert.equal(result.KUABNSLV, 'Michael Casadonte');
    assert.isObject(result);
    assert.notEqual(Object.keys(result).length, 0);

    // If 'null' is passed as argument.
    result = index.getUsersKeyValue(null);
    assert.isNull(result);

    // Incorrect data structure passed as argument.
    const arr = [];
    arr.push('a');
    arr.push('b');
    arr.push('c');
    result = index.getUsersKeyValue(arr);
    assert.isNull(result);

    // Assert Errors are thrown.
    assert.throws(() => {
      index.getUsersKeyValue('');
    }, Error);
  });

  it('Test parseProject function', () => {
    index.getFieldsKeyValue(fieldsJson);
    index.getUsersKeyValue(contactsJson);
    // If 'null' is passed as an argument.
    let result = index.parseProjects(null);
    result.should.be.an('array');
    result.should.have.lengthOf(0);

    // @Todo add another data item, tests are returning false positives. E.g PAWS.
    const json = {
      data: [{
        id: 1,
        title: 'bar',
        status: 'incomplete',
        permalink: 'http://www.example.com',
        completedDate: '12/20/2020',
        description: 'loreum ipsum',
        childIds: [
          'IEAAVFCRI4DTAVJS',
          'IEAAVFCRI4CCTVBL',
          'IEAAVFCRI4CHEO3Q',
          'IEAAVFCRI4CCT5FN',
        ],
        customFields: [
          {
            id: 'IEAAVFCRJUAACZZF',
            value: 'foo',
          },
          {
            id: 'IEAAVFCRJUAAC4KN',
            value: 'bar',
          },
          {
            id: 'IEAAVFCRJUAADIXA',
            value: 'baz',
          },
          {
            id: 'IEAAVFCRJUAADNPU',
            value: 'buzz',
          },
          {
            id: 'IEAAVFCRJUAACEBT',
            value: 'KUABNOLM',
          },
        ],
        project: {
          authorId: 'KUABMKIC',
          ownerIds: ['KUABMKIC', 'KUABNSLV'],
          status: 'Green',
          startDate: '2015-08-26',
          endDate: '2015-11-17',
          createdDate: '2016-06-17T19:25:58Z',
        },
      }],
    };

    result = index.parseProjects(json);
    result.should.be.a('array');
    result.should.have.lengthOf(1);

    assert.equal(result[0].id, 1);
    assert.equal(result[0].title, 'bar');
    assert.equal(result[0].status, 'incomplete');
    assert.equal(result[0].permalink, 'http://www.example.com');
    assert.equal(result[0].completedDate, '12/20/2020');
    assert.equal(result[0].description, 'loreum ipsum');
    assert.isDefined(result[0].project);
    assert.isDefined(result[0].customFields);
    assert.equal(result[0].customFields.Category, 'foo');
    assert.equal(result[0].customFields.Percentcomplete, 'bar');
    assert.equal(result[0].customFields.IncludeinALLITSProjects, 'baz');
    assert.equal(result[0].customFields.ProjectSummary, 'buzz');
    assert.equal(result[0].customFields.ProjectMPP, 'Jim Olinger');
    assert.equal(result[0].project.authorName, 'Felix Zuniga');
    assert.deepEqual(result[0].project.ownerNames, ['Felix Zuniga', 'Michael Casadonte']);
  });

  it('Test setUserNameCorrespondingToOwnerId function', () => {
    index.getUsersKeyValue(contactsJson);
    // Single user id.
    let projectData = {
      authorId: 'KUABMKIC',
      ownerIds: ['KUABNOLM'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    let result = index.setUserNameCorrespondingToOwnerId(projectData);
    assert.equal(result, 'Jim Olinger');

    // Multiple user id.
    projectData = {
      authorId: 'KUABMKIC',
      ownerIds: ['KUABNOLM', 'KUAB3MAU', 'KX76FPT4'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    result = index.setUserNameCorrespondingToOwnerId(projectData);
    assert.deepEqual(result, ['Jim Olinger', 'William Yates', 'Web Development ']);

    // Empty user id.
    projectData = {
      authorId: 'KUABMKIC',
      ownerIds: [],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    result = index.setUserNameCorrespondingToOwnerId(projectData);
    assert.deepEqual(result, []);

    // Invalid user id.
    projectData = {
      authorId: 'KUABMKIC',
      ownerIds: ['foo'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    result = index.setUserNameCorrespondingToOwnerId(projectData);
    assert.deepEqual(result, []);

    // Empty project Id.
    projectData = {};
    result = index.setUserNameCorrespondingToOwnerId(projectData);
    assert.deepEqual(result, []);
  });

  it('Test setAuthorNameCorrespondingToAuthorId function', () => {
    index.getUsersKeyValue(contactsJson);
    // Single author id.
    let projectData = {
      authorId: 'KUABMKIC',
      ownerIds: ['KUABNOLM'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    let result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.equal(result, 'Felix Zuniga');

    // Empty author id.
    projectData = {
      authorId: '',
      ownerIds: [],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);

    // Invalid user id.
    projectData = {
      authorId: 'foo',
      ownerIds: ['foo'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);

    // undefined author id.
    projectData = {
      ownerIds: ['KUABMKIC'],
      status: 'Completed',
      createdDate: '2017-08-07T21:53:39Z',
      completedDate: '2017-12-04T16:41:15Z',
    };
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);

    // Empty project Id.
    projectData = {};
    result = index.setAuthorNameCorrespondingToAuthorId(projectData);
    assert.deepEqual(result, []);
  });

  it('Test setCustomFieldsKeyValue function', () => {
    index.getFieldsKeyValue(fieldsJson);
    index.getUsersKeyValue(contactsJson);
    let result = index.setCustomFieldsKeyValue('IEAAVFCRJUAACEBT', 'KUABUZ2V');
    assert.equal(result.key, 'ProjectMPP');
    assert.deepEqual(result.value, ['Khalil Daneshvar']);

    // Multiple MPP's.
    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAACEBT', 'KUABUZ2V,KUABNUJS,KUABSMOY');
    assert.equal(result.key, 'ProjectMPP');
    assert.deepEqual(result.value, ['Khalil Daneshvar', 'Gerard Au', 'Javier Torner']);

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAADIXA', 'foo');
    assert.equal(result.key, 'IncludeinALLITSProjects');
    assert.equal(result.value, 'foo');

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAADNPU', 'buzz');
    assert.equal(result.key, 'ProjectSummary');
    assert.equal(result.value, 'buzz');

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAACZZF', 'bar');
    assert.equal(result.key, 'Category');
    assert.equal(result.value, 'bar');

    result = index.setCustomFieldsKeyValue('IEAAVFCRJUAAC4KN', 'baz');
    assert.equal(result.key, 'Percentcomplete');
    assert.equal(result.value, 'baz');
  });
});
