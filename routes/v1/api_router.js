// require the needed modules
var express = require('express');

// create the router
var router = express.Router();

var usersRouter = require('./API/users');
var carsRouter = require('./API/cars');
var reviewsRouter = require('./API/reviews');
var rentallogRouter = require('./API/rentallog');

router.use('/users', usersRouter);
router.use('/cars', carsRouter);
router.use('/reviews', reviewsRouter);
router.use('/rentallog', rentallogRouter);

module.exports = router;