// require the needed modules
var express = require('express');

// create the router
var router = express.Router();

// var usersRouter = require('./API/users');
// var carsRouter = require('./API/cars');
// var reviewsRouter = require('./API/reviews');
// var rentallogRouter = require('./API/rentallog');

// router.use('/users', usersRouter);
// router.use('/cars', carsRouter);
// router.use('/reviews', reviewsRouter);
// router.use('/rentallog', rentallogRouter);

var v1Router = require('./v1/api_router');
var v2Router = require('./v2/api_router');

router.use('/v1', v1Router);
router.use('/v2', v2Router);

module.exports = router;