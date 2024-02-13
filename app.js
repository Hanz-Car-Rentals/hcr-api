// require the needed modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var crypto = require('crypto');

// require the routers
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');


// whipe deleted users daily
// var { start_daily_jobs } = require('./routes/functions/daily_checks');
// start_daily_jobs();

// create the express app
var app = express();

// view engine setup
app.use(express.static(__dirname + '/public'));

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use the routers
app.use('/', indexRouter);
app.use('/api', apiRouter);

app.post('/test', function(req, res) {
    console.log(req.body);
    res.send('Test route');
});


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error', { error: err });
//   console.log(err);
// });

module.exports = app;