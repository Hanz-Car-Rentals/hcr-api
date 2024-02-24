// require the needed modules
var express = require('express');
var swaggerUi = require('swagger-ui-express');
var docs = require('../docs/v1/swagger.json');

// create the router
var router = express.Router();

// user docs
router.use('/', swaggerUi.serve, swaggerUi.setup(docs));

module.exports = router;