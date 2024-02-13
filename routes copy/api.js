// require the needed modules
var express = require('express');
var db = require('../db');
var crypto = require('crypto');
var { newUser } = require('../functions/email');
var { send_error } = require('../functions/error');
var { check_token } = require('../functions/middleware');
var { rentCar } = require('../functions/cars');

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

// Car routes

router.get('/cars', check_token, function(req, res, next){
  db.query('SELECT * FROM cars', function (error, results, fields) {
    if (error) {
      send_error(error, "Error fetching cars");
      res.status(500).send({'message': 'Error fetching cars'});
    } else {
      res.status(200).send(results);
    }
  });
});

router.post('/cars/add', check_token, function(req, res, next){
  let brand = req.body.brand;
  let model = req.body.model;
  let year = req.body.year;
  let color = req.body.color;
  let price = req.body.price;

  if (brand && model && year && color && price) {
    db.query('INSERT INTO cars (brand, model, year, color, price) VALUES (?, ?, ?, ?, ?)', [brand, model, year, color, price], function (error, results, fields) {
      if (error) {
        send_error(error, "Error adding new car");
        res.status(500).send({'message': 'Error adding car'});
      } else {
        res.status(200).send({'message': 'Car added successfully'});
      };
    });
  }
  else {
    res.status(400).send({'message': 'Invalid request'});
  };
});

router.delete('/cars/remove', check_token, function(req, res, next){
  let id = req.body.id;

  if (id) {
    db.query('DELETE FROM cars WHERE id = ?', [id], function (error, results, fields) {
      if (error) {
        send_error(error, "Error removing car");
        res.status(500).send({'message': 'Error removing car'});
      } else {
        res.status(200).send({'message': 'Car removed successfully'});
      };
    });
  }
  else {
    res.status(400).send({'message': 'Invalid request'});
  };
});

router.put('/cars/rent/:id', check_token, function(req, res, next){
  let carId = req.params.id;
  let userId = req.body.user_id;
  let fromDate = req.body.from_date;
  let toDate = req.body.to_date;

  if (carId && userId && fromDate && toDate) {
    rentCar(userId, carId, fromDate, toDate).then(() => {
      res.status(200).send({'message': 'Car rented successfully'});
    }).catch((error) => {
      send_error(error, "Error renting car");
      res.status(500).send({'message': 'Error renting car'});
    });
  }
  else {
    res.status(400).send({'message': 'Invalid request'});
  };
});

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

// Review routes

router.get('/reviews', check_token, function(req, res, next){
  db.query('SELECT * FROM reviews', function (error, results, fields) {
    if (error) {
      send_error(error, "Error fetching reviews");
      res.status(500).send({'message': 'Error fetching reviews'});
    } else {
      res.status(200).send(results);
    }
  });
});

router.post('/reviews/add', check_token, function(req,res,next){
  let carId = req.body.car_id;
  let userId = req.body.user_id;
  let review = req.body.review;
  let rating = req.body.rating;

  if (carId && userId && review && rating) {
    db.query('INSERT INTO reviews (car_id, user_id, review, rating) VALUES (?, ?, ?, ?)', [carId, userId, review, rating], function (error, results, fields) {
      if (error) {
        send_error(error, "Error adding review");
        res.status(500).send({'message': 'Error adding review'});
      } else {
        res.status(200).send({'message': 'Review added successfully'});
      };
    });
  }
  else {
    res.status(400).send({'message': 'Invalid request'});
  };
});

router.delete('/reviews/remove/:id', check_token, function(req, res, next){
  let id = req.params.id;

  if (id) {
    db.query('DELETE FROM reviews WHERE id = ?', [id], function (error, results, fields) {
      if (error) {
        send_error(error, "Error removing review");
        res.status(500).send({'message': 'Error removing review'});
      } else {
        res.status(200).send({'message': 'Review removed successfully'});
      };
    });
  }
  else {
    res.status(400).send({'message': 'Invalid request'});
  };
});

module.exports = router;