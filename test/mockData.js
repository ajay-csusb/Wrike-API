var index = require('../controllers/indexController')
var nock = require('nock')
var foldersJson = require('./folders.json')
var fieldsJson = require('./fields.json')
var contactsJson = require('./contacts.json')
module.exports = {
  mockData: function () {
    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/folders/IEAAVFCRI4DTAVJS,IEAAVFCRI4CCTVBL,IEAAVFCRI4CHEO3Q,IEAAVFCRI4CCT5FN')
      .reply(200, {
        'kind': 'folders',
        'data': [
          {
            'id': 'IEAAVFCRI4CCTVBL',
            'accountId': 'IEAAVFCR',
            'title': 'MyCoyote Upgrade - PS Bundle',
            'createdDate': '2015-11-17T22:24:08Z',
            'updatedDate': '2017-06-16T22:41:10Z',
            'description': '',
            'code': '900',
            'childIds': [],
            'superParentIds': [],
            'scope': 'WsFolder',
            'hasAttachments': false,
            'permalink': 'https://www.wrike.com/open.htm?id=69850155',
            'workflowId': 'IEAAVFCRK777K25P',
            'metadata': [],
            'customFields': [
              {
                'id': 'IEAAVFCRJUAAAYDM',
                'value': '2016-12-30'
              },
              {
                'id': 'IEAAVFCRJUAAAYDL',
                'value': '20'
              },
              {
                'id': 'IEAAVFCRJUAACEBT',
                'value': 'KUABWUQK'
              },
              {
                'id': 'IEAAVFCRJUAABXYB',
                'value': ''
              }
            ]
          }]
      })

// Mock '/folders'
    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders')
      .reply(200, {
        'kind': 'folderTree',
        'data': [
          {
            'id': 'IEAAVFCRI7777777',
            'title': 'foo',
            'childIds': [
              'IEAAVFCRI4DTAVJS',
              'IEAAVFCRI4CCTVBL',
              'IEAAVFCRI4CHEO3Q',
              'IEAAVFCRI4CCT5FN'
            ],
            'scope': 'bar'
          }]
      })

// Mock '/folders' + arguments
    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/foo')
      .replyWithError({'message': 'An error occured during the GET operation'})
      .emit('request', function (req, interceptor) {
        console.log('request called')
        var error = 'An error occurred'
        var callback = sinon.stub()
        callback.withArgs(error, null).returns(error)
      })

// Mock '/customfields'
    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/customfields')
      .reply(200, fieldsJson)
// .reply(200, {
//  'kind': 'customfields',
//  'data': [
//    {
//      'id': 'IEAAVFCRJUAADIXA',
//      'accountId': 'IEAAVFCR',
//      'title': 'Include in ALL ITS Projects',
//      'type': 'Checkbox',
//      'sharedIds': [],
//      'settings': {
//        'inheritanceType': 'Projects'
//      }
//    },
//    {
//      'id': 'IEAAVFCRJUAADNPU',
//      'accountId': 'IEAAVFCR',
//      'title': 'Project Summary',
//      'type': 'Text',
//      'sharedIds': [],
//      'settings': {
//        'inheritanceType': 'Folders'
//      }
//    },
//    {
//      'id': 'IEAAVFCRJUAADNP4',
//      'accountId': 'IEAAVFCR',
//      'title': 'ITS Strategic Plan Alignment',
//      'type': 'DropDown',
//      'sharedIds': [],
//      'settings': {
//        'inheritanceType': 'All',
//        'values': [
//          'Goal 1 - E-Learning',
//          'Goal 2 - iCoyote',
//          'Goal 3 - University Analytics',
//          'Goal 4 - Stable & Secure Infrastructure',
//          'Goal 5  - iEngage'
//        ],
//        'allowOtherValues': false
//      }
//    }
//  ]
// })

// Mock Users.
    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/contacts')
      .reply(200, contactsJson)

    var res1 = {
      'data': [
        {
          'userId': 1,
          'id': 1,
          'title': 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
          'body': 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
        },
        {
          'userId': 1,
          'id': 2,
          'title': 'qui est esse',
          'body': 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
        },
        {
          'userId': 1,
          'id': 3,
          'title': 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
          'body': 'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut'
        }
      ]
    }

    var res2 = {
      'data': [
        {
          'userId': 1,
          'id': 4,
          'title': 'eum et est occaecati',
          'body': 'ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit'
        },
        {
          'userId': 1,
          'id': 5,
          'title': 'nesciunt quas odio',
          'body': 'repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque'
        },
        {
          'userId': 1,
          'id': 6,
          'title': 'dolorem eum magni eos aperiam quia',
          'body': 'ut aspernatur corporis harum nihil quis provident sequi\nmollitia nobis aliquid molestiae\nperspiciatis et ea nemo ab reprehenderit accusantium quas\nvoluptate dolores velit et doloremque molestiae'
        }
      ]
    }

    var res3 = {
      'data': [
        {
          'userId': 1,
          'id': 7,
          'title': 'magnam facilis autem',
          'body': 'dolore placeat quibusdam ea quo vitae\nmagni quis enim qui quis quo nemo aut saepe\nquidem repellat excepturi ut quia\nsunt ut sequi eos ea sed quas'
        },
        {
          'userId': 1,
          'id': 8,
          'title': 'dolorem dolore est ipsam',
          'body': 'dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae'
        },
        {
          'userId': 1,
          'id': 9,
          'title': 'nesciunt iure omnis dolorem tempora et accusantium',
          'body': 'consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas'
        }
      ]
    }

    var res4 = {
      'data': [
        {
          'userId': 1,
          'id': 10,
          'title': 'optio molestias id quia eum',
          'body': 'quo et expedita modi cum officia vel magni\ndoloribus qui repudiandae\nvero nisi sit\nquos veniam quod sed accusamus veritatis error'
        },
        {
          'userId': 2,
          'id': 11,
          'title': 'et ea vero quia laudantium autem',
          'body': 'delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi'
        },
        {
          'userId': 2,
          'id': 12,
          'title': 'in quibusdam tempore odit est dolorem',
          'body': 'itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio'
        }
      ]
    }

    var res5 = {
      'data': [
        {
          'userId': 13,
          'id': 13,
          'title': 'voluptatem eligendi optio',
          'body': 'quo et expedita modi cum officia vel magni\ndoloribus qui repudiandae\nvero nisi sit\nquos veniam quod sed accusamus veritatis error'
        },
        {
          'userId': 14,
          'id': 14,
          'title': 'eveniet quod temporibus',
          'body': 'delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi'
        },
        {
          'userId': 15,
          'id': 15,
          'title': 'sint suscipit perspiciatis velit dolorum rerum ipsa laboriosam odio',
          'body': 'itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio'
        }
      ]
    }

    var res6 = {
      'data': [
        {
          'userId': 16,
          'id': 16,
          'title': 'fugit voluptas sed molestias voluptatem provident',
          'body': 'quo et expedita modi cum officia vel magni\ndoloribus qui repudiandae\nvero nisi sit\nquos veniam quod sed accusamus veritatis error'
        },
        {
          'userId': 17,
          'id': 17,
          'title': 'voluptate et itaque vero tempora molestiae',
          'body': 'delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi'
        },
        {
          'userId': 18,
          'id': 18,
          'title': 'adipisci placeat illum aut reiciendis qui',
          'body': 'itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio'
        }
      ]
    }

    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/IEAAVFCRI4CWDEWT,IEAAVFCRI4CBPR5A,IEAAVFCRI4CNTATB,IEAAVFCRI4CU6TUU,IEAAVFCRI4CYLQPE,IEAAVFCRI4B6RC6O,IEAAVFCRI4FFX7Q5,IEAAVFCRI4CLJU7S,IEAAVFCRI4D6TVWD,IEAAVFCRI4CWVAHB,IEAAVFCRI4EPEETZ,IEAAVFCRI4CLJQL7,IEAAVFCRI4EA6JJD,IEAAVFCRI4C4FIXN,IEAAVFCRI4DL3FCS,IEAAVFCRI4CAKGNX,IEAAVFCRI4D7TBGN,IEAAVFCRI4EA6J42,IEAAVFCRI4EA6JJY,IEAAVFCRI4CNU7BA,IEAAVFCRI4CNXUAA,IEAAVFCRI4EBOLUI,IEAAVFCRI4FF2SWX,IEAAVFCRI4CB3HBI,IEAAVFCRI4CCDMFY,IEAAVFCRI4FPARDQ,IEAAVFCRI4FPAQX4,IEAAVFCRI4FPAQZ6,IEAAVFCRI4D4DEYR,IEAAVFCRI4D4DDUT,IEAAVFCRI4COXSNL,IEAAVFCRI4CWIY4F,IEAAVFCRI4CBPQVF,IEAAVFCRI4CWVAFZ,IEAAVFCRI4EGKNIG,IEAAVFCRI4CCTTT4,IEAAVFCRI4CEECMU,IEAAVFCRI4CBPQP7,IEAAVFCRI4CCNPWO,IEAAVFCRI4CWVADB,IEAAVFCRI4CWDKC5,IEAAVFCRI4CLJTPZ,IEAAVFCRI4E5LRQQ,IEAAVFCRI4FI4R56,IEAAVFCRI4FI4RA5,IEAAVFCRI4FPALAT,IEAAVFCRI4FPAK5I,IEAAVFCRI4FPATEJ,IEAAVFCRI4FPASJ2,IEAAVFCRI4FPAKW5,IEAAVFCRI4FPANP6,IEAAVFCRI4EMVYOK,IEAAVFCRI4CNAJKR,IEAAVFCRI4CNAJRS,IEAAVFCRI4CNAJLX,IEAAVFCRI4CNAJMZ,IEAAVFCRI4CNAJN3,IEAAVFCRI4CNAJP3,IEAAVFCRI4CNAJXA,IEAAVFCRI4EBGRZB,IEAAVFCRI4CNAJSH,IEAAVFCRI4CNAJPH,IEAAVFCRI4CNAJRI,IEAAVFCRI4CNAJNJ,IEAAVFCRI4CNAJOK,IEAAVFCRI4CNAJLM,IEAAVFCRI4CCT5W4,IEAAVFCRI4CQLTTP,IEAAVFCRI4CQLTSL,IEAAVFCRI4CNA3GS,IEAAVFCRI4CNA3FV,IEAAVFCRI4CLTRKR,IEAAVFCRI4CNA3II,IEAAVFCRI4FBHU5T,IEAAVFCRI4CNXTY4,IEAAVFCRI4ETZLFB,IEAAVFCRI4CNAPGX,IEAAVFCRI4CNAPDZ,IEAAVFCRI4CNAO75,IEAAVFCRI4CNAPC5,IEAAVFCRI4CNAPE6,IEAAVFCRI4CNARD6,IEAAVFCRI4CNARI7,IEAAVFCRI4DXJGQG,IEAAVFCRI4CNARFF,IEAAVFCRI4CNAPCG,IEAAVFCRI4FBZJRK,IEAAVFCRI4CNAPDL,IEAAVFCRI4CNAPZM,IEAAVFCRI4CNAPEN,IEAAVFCRI4CNAPGN,IEAAVFCRI4EA6KFX,IEAAVFCRI4EA6KLG,IEAAVFCRI4CNALWN,IEAAVFCRI4EPEEXC,IEAAVFCRI4EPEEUR,IEAAVFCRI4EGKNKA,IEAAVFCRI4EPEE4X,IEAAVFCRI4EPEEV7,IEAAVFCRI4D4C64D')
      .reply(200, res1)

    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/IEAAVFCRI4D4C64D,IEAAVFCRI4CNAUXA,IEAAVFCRI4CNASKQ,IEAAVFCRI4CNASGC,IEAAVFCRI4CNASJE,IEAAVFCRI4CNASJU,IEAAVFCRI4CNASKV,IEAAVFCRI4CNASHI,IEAAVFCRI4EC4XEE,IEAAVFCRI4CNASIK,IEAAVFCRI4CNASG6,IEAAVFCRI4CNASK6,IEAAVFCRI4CNATH7,IEAAVFCRI4CNAVBQ,IEAAVFCRI4CNAW3D,IEAAVFCRI4CNAXVU,IEAAVFCRI4CNAW5V,IEAAVFCRI4CNAU5V,IEAAVFCRI4CNAVHW,IEAAVFCRI4CNAXCH,IEAAVFCRI4CNAUYL,IEAAVFCRI4CNAXS7,IEAAVFCRI4CNAT5U,IEAAVFCRI4CNATMX,IEAAVFCRI4CNATJI,IEAAVFCRI4CNAUBZ,IEAAVFCRI4CNAUEL,IEAAVFCRI4CNAUK7,IEAAVFCRI4CNAT27,IEAAVFCRI4CNTBKL,IEAAVFCRI4CNTBHB,IEAAVFCRI4CNTBQB,IEAAVFCRI4CNS44E,IEAAVFCRI4CNTBNG,IEAAVFCRI4DTATC2,IEAAVFCRI4CUSPRX,IEAAVFCRI4CUSPWG,IEAAVFCRI4CLJTYF,IEAAVFCRI4CLJVIW,IEAAVFCRI4D6TV62,IEAAVFCRI4D6ZKM3,IEAAVFCRI4D6TVVR,IEAAVFCRI4CLJUZ5,IEAAVFCRI4CNA3V3,IEAAVFCRI4CLJUWJ,IEAAVFCRI4CLJTZJ,IEAAVFCRI4CI23E5,IEAAVFCRI4CI23EP,IEAAVFCRI4CO3VE5,IEAAVFCRI4CSPHNP,IEAAVFCRI4CQGF3K,IEAAVFCRI4CO3VFQ,IEAAVFCRI4CO3VGC,IEAAVFCRI4CO3VKC,IEAAVFCRI4CAIUQD,IEAAVFCRI4CAIUO4,IEAAVFCRI4EWKAOF,IEAAVFCRI4EWKANE,IEAAVFCRI4D63MSU,IEAAVFCRI4D4SICC,IEAAVFCRI4D4SFZS,IEAAVFCRI4D4SGTH,IEAAVFCRI4FBKYWX,IEAAVFCRI4FBKYKL,IEAAVFCRI4CNAKCQ,IEAAVFCRI4CNALCQ,IEAAVFCRI4CNALRC,IEAAVFCRI4CNAKXV,IEAAVFCRI4CNALJX,IEAAVFCRI4DV2ZTF,IEAAVFCRI4CNALQY,IEAAVFCRI4CNALV2,IEAAVFCRI4CNALT2,IEAAVFCRI4CNALR7,IEAAVFCRI4FAY2VO,IEAAVFCRI4D6TWDK,IEAAVFCRI4EBF3WR,IEAAVFCRI4D6TVGB,IEAAVFCRI4EBFZKY,IEAAVFCRI4E6G3TJ,IEAAVFCRI4D6ZJUG,IEAAVFCRI4ETZ7UX,IEAAVFCRI4FEMJXK,IEAAVFCRI4FMOT5V,IEAAVFCRI4EBF2AG,IEAAVFCRI4FOEYEW,IEAAVFCRI4FS6PLW,IEAAVFCRI4DT3LDE,IEAAVFCRI4ECNXO4,IEAAVFCRI4FF27KG,IEAAVFCRI4EHOYGK,IEAAVFCRI4EHOYCI,IEAAVFCRI4CCT6H2,IEAAVFCRI4CCT6HO,IEAAVFCRI4CO47WN,IEAAVFCRI4CBVYKV,IEAAVFCRI4DCHCND,IEAAVFCRI4CNXTN7,IEAAVFCRI4CLJQIN,IEAAVFCRI4CLJQJJ')
      .reply(200, res2)

    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/IEAAVFCRI4CLJQJJ,IEAAVFCRI4CNAYHQ,IEAAVFCRI4CNAYBD,IEAAVFCRI4FBZIKY,IEAAVFCRI4CNAYL5,IEAAVFCRI4CLPUPH,IEAAVFCRI4CLJWFV,IEAAVFCRI4CLPUOE,IEAAVFCRI4CLJUFP,IEAAVFCRI4CLPUQ3,IEAAVFCRI4EOPRRG,IEAAVFCRI4CLOQCV,IEAAVFCRI4CLPSMU,IEAAVFCRI4EBOLST,IEAAVFCRI4DOGSVH,IEAAVFCRI4CLPS3T,IEAAVFCRI4CLPS2S,IEAAVFCRI4CLPEMR,IEAAVFCRI4CLPSIR,IEAAVFCRI4CLPSZQ,IEAAVFCRI4EUQOKA,IEAAVFCRI4CLPEC6,IEAAVFCRI4CLOQE4,IEAAVFCRI4CLPSYZ,IEAAVFCRI4CLOQBF,IEAAVFCRI4CLPS3C,IEAAVFCRI4CLPEDO,IEAAVFCRI4DT3MBE,IEAAVFCRI4CLJVBP,IEAAVFCRI4CLPS7L,IEAAVFCRI4CLPEOI,IEAAVFCRI4DV2SUM,IEAAVFCRI4DT3KJK,IEAAVFCRI4DT3LIW,IEAAVFCRI4CNU7DG,IEAAVFCRI4CNAX2V,IEAAVFCRI4CLJUHS,IEAAVFCRI4CLJUGJ,IEAAVFCRI4CNO42R,IEAAVFCRI4EBGEAZ,IEAAVFCRI4CNO5Q5,IEAAVFCRI4CNO423,IEAAVFCRI4CNO5I2,IEAAVFCRI4CNA3W7,IEAAVFCRI4CNBZYB,IEAAVFCRI4CNBLWB,IEAAVFCRI4DT3JHO,IEAAVFCRI4CNBLYF,IEAAVFCRI4CNO42B,IEAAVFCRI4CNJ7KN,IEAAVFCRI4CNBZUN,IEAAVFCRI4CNO52J,IEAAVFCRI4CNKAKK,IEAAVFCRI4CNO6BT,IEAAVFCRI4CNO434,IEAAVFCRI4CNO55E,IEAAVFCRI4CNO6PB,IEAAVFCRI4CNBZVI,IEAAVFCRI4DVQT3B,IEAAVFCRI4CNO5PO,IEAAVFCRI4CNO43L,IEAAVFCRI4DT3H2D,IEAAVFCRI4DT3JEC,IEAAVFCRI4CNU2CZ,IEAAVFCRI4CNU2C6,IEAAVFCRI4CNPAGT,IEAAVFCRI4FFXYE6,IEAAVFCRI4CLJUIT,IEAAVFCRI4CNU6SS,IEAAVFCRI4CNU6RT,IEAAVFCRI4DV4TQV,IEAAVFCRI4DT3KQW,IEAAVFCRI4CNU6TR,IEAAVFCRI4CNU64R,IEAAVFCRI4CNU7BW,IEAAVFCRI4CNU2BV,IEAAVFCRI4CNU6YV,IEAAVFCRI4EUOHHX,IEAAVFCRI4CNU7CL,IEAAVFCRI4CNU65P,IEAAVFCRI4CNU2DM,IEAAVFCRI4CNU6ZN,IEAAVFCRI4CNU2CN,IEAAVFCRI4CYPTFQ,IEAAVFCRI4CNU6SC,IEAAVFCRI4CNU6RA,IEAAVFCRI4D6TWBP,IEAAVFCRI4D6TWAO,IEAAVFCRI4D6ZH5O,IEAAVFCRI4E57W5V,IEAAVFCRI4CNYMGS,IEAAVFCRI4ERU7R3,IEAAVFCRI4DWOSYS,IEAAVFCRI4D4SJPM,IEAAVFCRI4D4SIUP,IEAAVFCRI4D4SJF6,IEAAVFCRI4D4SILQ,IEAAVFCRI4D4SIYT,IEAAVFCRI4D4SKCC,IEAAVFCRI4D4SJBE')
      .reply(200, res3)

    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/IEAAVFCRI4D4SJBE,IEAAVFCRI4DFOQYX,IEAAVFCRI4CH46L7,IEAAVFCRI4CUSKWL,IEAAVFCRI4EX5RN5,IEAAVFCRI4EGH2PH,IEAAVFCRI4FPWPP6,IEAAVFCRI4FPWUN5,IEAAVFCRI4D4DHCL,IEAAVFCRI4FPWUDW,IEAAVFCRI4CBVXQX,IEAAVFCRI4FJQO4X,IEAAVFCRI4D4DFWT,IEAAVFCRI4FPWQRI,IEAAVFCRI4DKJ45S,IEAAVFCRI4CHPJFB,IEAAVFCRI4DFOQON,IEAAVFCRI4D4DDS4,IEAAVFCRI4CFEBIP,IEAAVFCRI4C4FJK4,IEAAVFCRI4CUSMRK,IEAAVFCRI4CUSNPN,IEAAVFCRI4EGHXEH,IEAAVFCRI4EGHWUJ,IEAAVFCRI4D4DGFV,IEAAVFCRI4EGHYYX,IEAAVFCRI4CQGJZW,IEAAVFCRI4C447HY,IEAAVFCRI4EX5QCD,IEAAVFCRI4CUSPPW,IEAAVFCRI4CHEMQQ,IEAAVFCRI4FPAS62,IEAAVFCRI4CFKIM3,IEAAVFCRI4CMOREI,IEAAVFCRI4CQCDJO,IEAAVFCRI4EREGGC,IEAAVFCRI4DVGZRC,IEAAVFCRI4FLHX7B,IEAAVFCRI4CHFUBB,IEAAVFCRI4FPAQLF,IEAAVFCRI4CHUWBB,IEAAVFCRI4CEECO6,IEAAVFCRI4FI4Q4Q,IEAAVFCRI4CMORQZ,IEAAVFCRI4CXSBJI,IEAAVFCRI4CKCW7Y,IEAAVFCRI4CMOT4N,IEAAVFCRI4EGH2PH,IEAAVFCRI4CU2UDE,IEAAVFCRI4FMYFJH,IEAAVFCRI4C35SEF,IEAAVFCRI4CCT5HV,IEAAVFCRI4DDF4T4,IEAAVFCRI4FJQO4X,IEAAVFCRI4FPCMUB,IEAAVFCRI4EMJRPW,IEAAVFCRI4CX5FK5,IEAAVFCRI4CO47WN,IEAAVFCRI4CFCA7S,IEAAVFCRI4DBFHJF,IEAAVFCRI4COTALT,IEAAVFCRI4CCT7NF,IEAAVFCRI4DSXUOX,IEAAVFCRI4CAIUN2,IEAAVFCRI4FBJSY2,IEAAVFCRI4CUSPPW,IEAAVFCRI4COXSTI,IEAAVFCRI4C4PWKR,IEAAVFCRI4COXTQN,IEAAVFCRI4COXSY4,IEAAVFCRI4COX2DM,IEAAVFCRI4COXUGS,IEAAVFCRI4COXTQC,IEAAVFCRI4CTYHQF,IEAAVFCRI4COXTFC,IEAAVFCRI4COXSUU,IEAAVFCRI4CB3HA5,IEAAVFCRI4CH46L7,IEAAVFCRI4CBV2D5,IEAAVFCRI4CEX3EM,IEAAVFCRI4CCWP4D,IEAAVFCRI4EGARNJ,IEAAVFCRI4D4DHCL,IEAAVFCRI4CLJTWY,IEAAVFCRI4CBVXQX,IEAAVFCRI4FBJSY2,IEAAVFCRI4EU7QMA,IEAAVFCRI4FJQO4X,IEAAVFCRI4CQ2U33,IEAAVFCRI4CRK3JC,IEAAVFCRI4FK7POX,IEAAVFCRI4EYNHV6,IEAAVFCRI4CBV2PC,IEAAVFCRI4CCYF6W,IEAAVFCRI4C23WRW,IEAAVFCRI4CFEBIP,IEAAVFCRI4CQBJQR,IEAAVFCRI4CQBOSF,IEAAVFCRI4CQBPPV,IEAAVFCRI4CQBJAY')
      .reply(200, res4)

    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/IEAAVFCRI4CQBJAY,IEAAVFCRI4CCWP4D,IEAAVFCRI4CQBKVK,IEAAVFCRI4CCT7NF,IEAAVFCRI4CQBJCM,IEAAVFCRI4CCNQKY,IEAAVFCRI4CHEMQQ,IEAAVFCRI4E53PNZ,IEAAVFCRI4E53UWV,IEAAVFCRI4E53YEV,IEAAVFCRI4D4DHCL,IEAAVFCRI4E53O7W,IEAAVFCRI4CBVXQX,IEAAVFCRI4FBJSY2,IEAAVFCRI4DDNXXZ,IEAAVFCRI4EU7QMA,IEAAVFCRI4E53OAS,IEAAVFCRI4FJQO4X,IEAAVFCRI4FLHX7B,IEAAVFCRI4FK7POX,IEAAVFCRI4C23WRW,IEAAVFCRI4E53RAB,IEAAVFCRI4E53OPD,IEAAVFCRI4FSBMFA,IEAAVFCRI4COEALD,IEAAVFCRI4EUMEUH,IEAAVFCRI4C6KDJA,IEAAVFCRI4ETO2DR,IEAAVFCRI4CNXYB4,IEAAVFCRI4DSL3XN,IEAAVFCRI4DE2VWE,IEAAVFCRI4CNYPGQ,IEAAVFCRI4CBVXQX,IEAAVFCRI4ETZLIN,IEAAVFCRI4C3LUQD,IEAAVFCRI4FCZTYX,IEAAVFCRI4CLJNQJ,IEAAVFCRI4FD5YGD,IEAAVFCRI4EMJRPW,IEAAVFCRI4CLJNOW,IEAAVFCRI4CBPQSV,IEAAVFCRI4E5PDVU,IEAAVFCRI4EGHYYX,IEAAVFCRI4EGARNJ,IEAAVFCRI4FO7CRG,IEAAVFCRI4D4DHCL,IEAAVFCRI4FJQO4X,IEAAVFCRI4FUQKIJ,IEAAVFCRI4CIRCKK,IEAAVFCRI4E4SNSL,IEAAVFCRI4EGH2PH,IEAAVFCRI4CCT5FN,IEAAVFCRI4DL3FAY,IEAAVFCRI4CBV2D5,IEAAVFCRI4CCWP4D,IEAAVFCRI4CU2UDE,IEAAVFCRI4ERUZZQ,IEAAVFCRI4FBJSY2,IEAAVFCRI4DDF4T4,IEAAVFCRI4FCRCO3,IEAAVFCRI4CCT5D2,IEAAVFCRI4DBFHJF,IEAAVFCRI4D3MH6B,IEAAVFCRI4CCT5TR,IEAAVFCRI4CBV2PC,IEAAVFCRI4C35SEF,IEAAVFCRI4FBKUYJ,IEAAVFCRI4FBKYEJ,IEAAVFCRI4BWT6UV,IEAAVFCRI4CCT5HV,IEAAVFCRI4E6AFX5,IEAAVFCRI4EU7QMA,IEAAVFCRI4EGHXHQ,IEAAVFCRI4COXT3M,IEAAVFCRI4D63NLV,IEAAVFCRI4CBV2G3,IEAAVFCRI4C3YTZ4,IEAAVFCRI4CX5E23,IEAAVFCRI4EGCING,IEAAVFCRI4C3YJRG,IEAAVFCRI4CHF26J,IEAAVFCRI4EMJQ3I,IEAAVFCRI4E53RAB,IEAAVFCRI4CBPR5F,IEAAVFCRI4D4DD5J,IEAAVFCRI4EPEEOX,IEAAVFCRI4D4SL2A,IEAAVFCRI4D63NJW,IEAAVFCRI4D4SL7F,IEAAVFCRI4D3C3RA,IEAAVFCRI4D3C3WA,IEAAVFCRI4D3RTUA,IEAAVFCRI4D3C2WJ,IEAAVFCRI4COXSXA,IEAAVFCRI4COXSXW,IEAAVFCRI4FJQXWZ,IEAAVFCRI4DCTMNJ,IEAAVFCRI4DE2V4I,IEAAVFCRI4CNYMIS,IEAAVFCRI4DAIHQX')
      .reply(200, res2)

    nock('http://www.wrike.com', {
      reqheaders: {
        'authorization': 'Bearer ' + index.token
      }
    })
      .get('/api/v3/folders/IEAAVFCRI4DAIHQX,IEAAVFCRI4CNXTOO,IEAAVFCRI4E7EB7H,IEAAVFCRI4ER5BYJ,IEAAVFCRI4EZPG2N,IEAAVFCRI4DI4FST,IEAAVFCRI4C3X4TF,IEAAVFCRI4C3YG45,IEAAVFCRI4C3YAC2,IEAAVFCRI4DCHCQI,IEAAVFCRI4D7TAWV,IEAAVFCRI4CLJQIZ,IEAAVFCRI4EQDZVR,IEAAVFCRI4CNXUBI,IEAAVFCRI4CNXU5M,IEAAVFCRI4CNXUXM,IEAAVFCRI4CNYFVF,IEAAVFCRI4CNXXFA,IEAAVFCRI4EFNBPN,IEAAVFCRI4EZPDVL,IEAAVFCRI4CNXXHG,IEAAVFCRI4E7EDGM,IEAAVFCRI4CLJNUK,IEAAVFCRI4DE2VWE,IEAAVFCRI4CAKHNF,IEAAVFCRI4CAKHNB,IEAAVFCRI4CAKHNK,IEAAVFCRI4DL3F7M,IEAAVFCRI4DL3FIZ,IEAAVFCRI4DL3GMH,IEAAVFCRI4DL3FFX,IEAAVFCRI4DL3GFG,IEAAVFCRI4CNPAUW,IEAAVFCRI4EC5EKM,IEAAVFCRI4CNU2AJ,IEAAVFCRI4CNU2AZ,IEAAVFCRI4CNUZ6J,IEAAVFCRI4CNPART,IEAAVFCRI4CNPAXA,IEAAVFCRI4DT3JSH,IEAAVFCRI4EC5EET,IEAAVFCRI4CNPATJ,IEAAVFCRI4EHO32J,IEAAVFCRI4CNXT3T,IEAAVFCRI4CNXT4C,IEAAVFCRI4EUMX6G,IEAAVFCRI4ET2KZM,IEAAVFCRI4CLJTWY,IEAAVFCRI4DNHUKW,IEAAVFCRI4ERU4MI,IEAAVFCRI4DEZVK3,IEAAVFCRI4EAMMBO,IEAAVFCRI4D3MHFK')
      .reply(200, res3)
  }
}
