// require the needed modules
var express = require('express');
var db = require('../db');
var { send_error } = require('../functions/error');
var { check_token } = require('../functions/middleware');

// create the router
var router = express.Router();

// Rental log routes
router.get('/rentallog', check_token, function(req, res, next){
  db.query('SELECT * FROM rentallog', function (error, results, fields) {
    if (error) {
      send_error(error, "Error fetching rental log");
      res.status(500).send({'message': 'Error fetching rental log'});
    } else {
      res.status(200).send(results);
    }
  });
});

module.exports = router;