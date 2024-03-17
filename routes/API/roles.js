// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  user_check,
  check_permission
} = require("../../functions/middleware");

// create the router
var router = express.Router();

// the route for getting all the roles
router.get("/", check_user_token, check_permission("GET_ROLES"), function(req, res, next){
	db.query("SELECT * FROM roles", function(err, results){
		if (err){
			send_error(err, "Error getting roles");
			res.status(500).send({status: 500, message: "Error getting roles"});
		} else {
			res.send({status: 200, message: "Roles", data: results});
		}
	});
});

module.exports = router;
