// require the needed modules
var express = require('express');

var swaggerUi = require('swagger-ui-express');
var docs = require('../docs/swagger.json');
const { SwaggerTheme } = require('swagger-themes');

const theme = new SwaggerTheme();

var router = express.Router();



const options = {
	explorer: false,
	customSiteTitle: 'HCR API Documentation v2',
	customCss: theme.getBuffer('dark-monokai'),
	customfavIcon: "/favicon.ico",
};

// send html to the user to click either v1 or v2 on the page 
router.get('/', function (req, res) {
	res.redirect('/docs/v2/');
});

// user docs
router.use('/v2', swaggerUi.serve, swaggerUi.setup(docs, options));

module.exports = router;