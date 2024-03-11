// require the needed modules
var express = require('express');

var router = express.Router();

var v1Router = require('./v1/doc_router');
router.use('/v1', v1Router);

var v2Router = require('./v2/doc_router');
router.use('/v2', v2Router);

// send html to the user to click either v1 or v2 on the page 
router.get('/', function (req, res) {
  res.send(`
  <html>
    <head>
      <title>API Documentation</title>
    </head>
    <body>
      <h1>API Documentation</h1>
      <p>Click on the version you want to see the documentation for:</p>
      <a href="/docs/v1">v1</a>
      <a href="/docs/v2">v2</a>
    </body>
  </html>
  `);
});

module.exports = router;