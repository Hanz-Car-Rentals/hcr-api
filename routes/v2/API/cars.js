// require the needed modules
var express = require("express");
var db = require("../../../db");
var { send_error } = require("../../../functions/v2/error");
var {
	check_user_token,
	admin_check,
	user_check,
} = require("../../../functions/v2/middleware");

// create the router
var router = express.Router();

// get /cars (all cars)
router.get("/", function (req, res) {
	db.query("SELECT * FROM cars", function (err, result) {
		if (err) {
			send_error(res, err);
		} else {
			res.send(result);
		}
	});
});

// get /cars/:id (car by id)
router.get("/:id", function (req, res) {
	db.query("SELECT * FROM cars WHERE id = ?", [req.params.id], function (
		err,
		result
	) {
		if (err) {
			send_error(res, err);
		} else {
			if (result.length > 0) {
				res.send(result);
			} else {
				res.status(404).send({ status: 404, message: "Car not found" });
			}
		}
	});
});

// post /cars/add/type (create a new type of car)
router.post("/add/type", admin_check, function (req, res) {
	let brand = req.body.brand;
	let model = req.body.model; // add this field to the table
	let trunk_space = req.body.trunk_space; // change this field to the corrent name
	let seats = req.body.seats; // add this field to the table
	let doors = req.body.doors;
	let fuel_type = req.body.fuel_type;
	let transmission = req.body.transmission; // add this field to the table
	let towing_weight = req.body.towing_weight;
	let maximum_gross_weight = req.body.maximum_gross_weight;
	let build_year = req.body.build_year;
	let body_type = req.body.body_type;

	db.query("INSERT INTO car_types SET ?", req.body, function (err, result) {
		if (err) {
			send_error(res, err);
		} else {
			res.send({ status: 200, message: "Car type added" });
		}
	});
});


module.exports = router;
