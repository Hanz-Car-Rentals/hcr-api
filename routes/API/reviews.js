// require the needed modules
var express = require('express');
var db = require('../../db');
var { send_error } = require('../../functions/error');
var { check_token } = require('../../functions/middleware');

// create the router
var router = express.Router();

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