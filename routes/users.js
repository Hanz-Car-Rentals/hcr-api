// require the needed modules
var express = require('express');
var db = require('../db');
var crypto = require('crypto');
var { newUser } = require('../functions/email');
var { send_error } = require('../functions/error');
var { check_token } = require('../functions/middleware');

// create the router
var router = express.Router();

// User routes
router.get('/users', check_token, function(req, res, next){
  db.query('SELECT id,email,email_verified,first_name,last_name,admin,times_rented,currently_renting FROM users', function (error, results, fields) {
      if (error) {
          send_error(error, "Error fetching users");
          res.status(500).send({'message': 'Error fetching users'});
      } else {
          res.status(200).send(results);
      }
  });
});

router.post('/users/add', check_token, function(req, res, next){
  let first_name = req.body.fname;
  let last_name = req.body.lname;
  let email = req.body.email;
  let password = req.body.password;

  const salt = crypto.randomBytes(16);

  crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return next(err); }
      if (first_name && last_name && email && password) {
          db.query('INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)', [first_name, last_name, email, hashedPassword, salt], function (error, results, fields) {
          if (error) {
              send_error(error, "Error creating new user");
              res.status(500).send({'message': 'Error creating user'});
          } else {
              if (err) { return next(err); }
              newUser(email, results.insertId, req.headers.host);
              res.status(200).send({'message': 'User created successfully'});
          }
          });
      }
      else {
          res.status(400).send({'message': 'Invalid request'});
      }
  });
});

module.exports = router;