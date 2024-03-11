// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  admin_check,
  user_check,
} = require("../../functions/middleware");

// create the router
var router = express.Router();



module.exports = router;
