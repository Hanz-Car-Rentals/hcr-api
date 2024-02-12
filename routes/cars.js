// require the needed modules
var express = require('express');
var db = require('../db');
var { send_error } = require('../functions/error');
var { check_token } = require('../functions/middleware');
var { rentCar } = require('../functions/cars');

// create the router
var router = express.Router();

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

module.exports = router;