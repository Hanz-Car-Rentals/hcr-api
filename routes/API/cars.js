// require the needed modules
var express = require('express');
var db = require('../../db');
var { send_error } = require('../../functions/error');
var { check_token } = require('../../functions/middleware');
var { rentCar } = require('../../functions/cars');

// create the router
var router = express.Router();

// Car routes

router.get('/', function(req, res, next){
  db.query('SELECT * FROM cars', function (error, results, fields) {
    if (error) {
      send_error(error, "Error fetching cars");
      res.status(500).send({'message': 'Error fetching cars'});
    } else {
      res.status(200).send(results);
    }
  });
});

router.post('/add', check_token, function(req, res, next){
  let brand = req.body.brand;
  let model = req.body.model;
  let year = req.body.year;
  let color = req.body.color;
  let price = req.body.price;
  let licence_plate = req.body.licence_plate;
  let seats = req.body.seats;
  let space = req.body.space;
  let transmission = req.body.transmission;
  let fuel = req.body.fuel;
  let doors = req.body.doors;
  let towing_weight = req.body.towing_weight;
  let maximum_gross_weight = req.body.maximum_gross_weight;
  let location = req.body.location;
  let picture_url = req.body.picture_url;

  if (brand && model && year && color && price && licence_plate && seats && space && transmission && fuel && doors && towing_weight && maximum_gross_weight && location && picture_url) {
    db.query('INSERT INTO cars ( brand, model, year, color, price, licence_plate, seats, space, transmission, fuel, doors, towing_weight, maximum_gross_weight, location, picture_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [brand,model,year,color,price,licence_plate,seats,space,transmission,fuel,doors,towing_weight,maximum_gross_weight,location,picture_url], function (error, results, fields) {
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

router.delete('/remove', check_token, function(req, res, next){
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

router.put('/rent/:id', check_token, function(req, res, next){
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

router.get('/car/:id', check_token, function(req, res, next){
  let id = req.params.id;

  if (id) {
    db.query('SELECT * FROM cars WHERE id = ?', [id], function (error, results, fields) {
      if (error) {
        send_error(error, "Error fetching car");
        res.status(500).send({'message': 'Error fetching car'});
      } else {
        res.status(200).send(results);
      };
    });
  }
  else {
    res.status(400).send({'message': 'Invalid request'});
  };
});

router.post('/update/:id', check_token, function(req, res, next){
  let id = req.params.id;
  let color = req.body.color;
  let price = req.body.price;
  let licence_plate = req.body.licence_plate;
  let location = req.body.location;
  let pictrue_url = req.body.pictrue_url;

  if (id && licence_plate && location && pictrue_url && color && price) {
    db.query('UPDATE cars SET color = ?, price = ?, licence_plate = ?, location = ?, picture_url = ? WHERE id = ?', [color, price, licence_plate, location, pictrue_url, id], function (error, results, fields) {
      if (error) {
        send_error(error, "Error updating car");
        res.send({"status":500, 'message': 'Error updating car'});
      } else {
        res.send({"status":200, 'message': 'Car updated successfully'});
      };
    });
  }
  else {
    res.send({'status':400,'message': 'Invalid request'});
  };
});

module.exports = router;