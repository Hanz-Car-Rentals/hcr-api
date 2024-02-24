// require the needed modules
var express = require('express');

// create the router
var router = express.Router();

var apiRouter = require('./api');
var docsRouter = require('./docs.js');

router.use('/api/v1', apiRouter);
router.use('/docs/v1', docsRouter);


module.exports = router;