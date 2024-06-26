// require the needed modules
var express = require('express');

// create the router
var router = express.Router();

var usersRouter = require('./API/users');
var carsRouter = require('./API/cars');
var reviewsRouter = require('./API/reviews');
var logsRouter = require('./API/logs');
var rolesRouter = require('./API/roles');
var locationsRouter = require('./API/locations');
var contactRouter = require('./API/contact');

router.use('/users', usersRouter);
router.use('/cars', carsRouter);
router.use('/reviews', reviewsRouter);
router.use('/logs', logsRouter);
router.use('/roles', rolesRouter);
router.use('/locations', locationsRouter);
router.use('/contact', contactRouter);

router.get('/', function(req, res, next){
    res.json({
        status: 418,
        message: "I'm a teapot"
    })
})

module.exports = router;