// require the needed modules
var express = require('express');
var db = require('../db');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

// create the router
var router = express.Router();

/* GET docs page. */
router.get('/', function(req, res, next){
  res.status(200).sendFile(path.join(__dirname, '../public/pages/docs/docs.html'));
});

let docFiles = fs.readdirSync(path.join(__dirname, '../public/pages/docs/v1'));
docFiles = docFiles.filter((file) => file.endsWith('.html') && file !== 'README.html');
docFiles.forEach((file) => {
    router.get('/' + file.replace('.html', ''), function(req, res, next){
        res.status(200).sendFile(path.join(__dirname, '../public/pages/docs/v1/' + file));
    });
    
});


module.exports = router;