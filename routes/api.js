// require the needed modules
var express = require('express');
// var db = require('../db');

// create the router
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  res.status(200).send('Welcome to the Todos API API');
});

router.post('/newuser', function(req, res, next){
    // check if the users email is valid and not already taken
    // if it is, send a verification email
    console.log("New User Post Request");
    let username = req.body.username;
    let password = req.body.password;
    console.log(`username: ${username}, password: ${password}`);
    res.status(200).send({'message': "user created"});
})

module.exports = router;