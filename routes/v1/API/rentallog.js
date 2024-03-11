// require the needed modules
var express = require('express');
var db = require('../../../db');
var { send_error } = require('../../../functions/v1/error');
var { check_user_token, admin_check, } = require('../../../functions/v1/middleware');

// create the router
var router = express.Router();

// Rental log routes
router.get('/', check_user_token, admin_check, function(req, res, next){
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