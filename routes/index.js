// require the needed modules
var express = require('express');
var path = require('path');
// var db = require('../db');

// create the router
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  res.status(200).send('Welcome to the Todos API');
});

router.get('/newuser', function (req, res, next){
    res.status(200).sendFile(path.join(__dirname, '../public/pages/index.html'));
})


module.exports = router;