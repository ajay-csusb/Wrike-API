const request = require('request');
const async = require('async');

let query = {};

// Send event updates to Drupal installations.
function broadcastEventUpdates(domains, callback) {
  request.get(`https://${domains}/update-events`, { qs: query }, (error, response, body) => {
    if (error) {
      console.log(error);
    }
    callback(null, body);
  });
}

// Broadcast event to all installation on Acquia.
function broadcastEvents(req, res) {
  query = req.query;
  async.map(req.body, broadcastEventUpdates, (error, result) => {
    if (error) {
      console.log(error);
    }
  });
  res.json({ message: 'Event update request sent to all sites.' });
}

module.exports = {
  broadcastEvents,
};
