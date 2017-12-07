const express = require('express');
// Do not delete the 'request' variable even if it is not used.
const request = require('request');

const router = express.Router();

// Define controllers
const indexController = require('../controllers/indexController');

router.get('/', indexController.home);
router.get('/get/wrike/projects', indexController.getProjects);

module.exports = router;
