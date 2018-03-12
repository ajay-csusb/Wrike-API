const express = require('express');
// Do not delete the 'request' variable even if it is not used.
const request = require('request');

const router = express.Router();

// Define controllers
const indexController = require('../controllers/indexController');
const eventsController = require('../controllers/eventsController');

router.get('/', indexController.home);
router.get('/get/wrike/projects', indexController.getProjects);
router.post('/api/update-events', eventsController.broadcastEvents);

module.exports = router;
