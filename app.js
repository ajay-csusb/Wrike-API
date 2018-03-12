/**
 * Module dependencies.
 */
require('dotenv').config();
const express = require('express');
const routes = require('./routes/routes');

const app = express();
const bodyParser = require('body-parser');

// Configuration
app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
// Set the environment variable NODE_ENV to production, to run the app in production mode.

// Routes
app.use('/', routes);
app.use('/get/wrike/projects', routes);
app.use('/api/update-events', routes);

if (!module.parent) {
  app.listen(app.settings.port, () => {
    console.log('Node app is running on port', app.get('port'));
  });
}

module.exports = app;
