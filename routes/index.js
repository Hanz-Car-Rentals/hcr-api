// require the needed modules
var express = require('express');

// create the router
var router = express.Router();

var apiRouter = require('./routes/api');
var docsRouter = require('./routes/docs.js');

app.use('/api/v1', apiRouter);
app.use('/docs/v1', docsRouter);


module.exports = router;