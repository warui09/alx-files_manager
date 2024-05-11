/**
 * Creates an express server listening on port set by the
 * environment variable or the default port 5000
 */

const express = require('express');

const port = process.env.PORT || 5000;
const app = express();
const routes = require('./routes/index');

// load all routes in routes/index
app.use('/', routes);

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Express app running on port ${port}`);
  }
});

module.exports = app;
