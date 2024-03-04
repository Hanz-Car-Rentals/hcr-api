// require the needed modules
var express = require('express');
var swaggerUi = require('swagger-ui-express');
var docs = require('../docs/v1/swagger.json');
const { SwaggerTheme } = require('swagger-themes');

const theme = new SwaggerTheme();

const options = {
  explorer: false,
  customSiteTitle: 'HCR API Documentation',
  customCss: theme.getBuffer('dark-monokai'),
  customfavIcon: "/favicon.ico",
};

// create the router
var router = express.Router();

// user docs
router.use('/', swaggerUi.serve, swaggerUi.setup(docs, options));

module.exports = router;