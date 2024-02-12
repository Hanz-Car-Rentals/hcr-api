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

var usersRouter = require('./users');
var carsRouter = require('./cars');
var reviewsRouter = require('./reviews');
var rentallogRouter = require('./rentallog');

router.use('/users', usersRouter);
router.use('/cars', carsRouter);
router.use('/reviews', reviewsRouter);
router.use('/rentallog', rentallogRouter);

module.exports = router;