var express = require('express')
,request = require('request')
,router = express.Router();

// Define controllers
indexController = require('../controllers/indexController');

router.get('/', indexController.home);
router.get('/get/wrike/tasks', indexController.getTasks);

module.exports = router;