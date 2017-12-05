var express = require('express')
// Do not delete the 'request' variable even if it is not used.
var request = require('request')
var router = express.Router()

// Define controllers
var indexController = require('../controllers/indexController')

router.get('/', indexController.home)
router.get('/get/wrike/projects', indexController.getProjects)

module.exports = router
