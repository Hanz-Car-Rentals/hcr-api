// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
	check_user_token,
	user_check,
	checkPermission
} = require("../../functions/middleware");

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
router.get("/car/:id", function (req, res) {
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

// get /cars/fuel (all fuel types)
router.get("/fuel", function (req, res) {
	db.query("SELECT * FROM fuel_types", function (err, result) {
		if (err) {
			send_error(res, err);
		}
		res.send(result);
	});
});

// get /cars/types (all car types)
router.get("/types", function (req, res) {
	db.query("SELECT * FROM car_types", function (err, result) {
		if (err) {
			send_error(res, err);
		}
		res.send(result);
	});
});

// post /cars/add/type (create a new type of car)
router.post("/add/cartype", check_user_token, checkPermission("ADD_REMOVE_VEHICLES"), async function (req, res) {
	let brand = req.body.brand;
	let model = req.body.model;
	let trunk_space = req.body.trunk_space;
	let seats = req.body.seats;
	let doors = req.body.doors;
	let fuel_type = req.body.fuel_type;
	let transmission = req.body.transmission;
	let towing_weight = req.body.towing_weight;
	let maximum_gross_weight = req.body.maximum_gross_weight;
	let build_year = req.body.build_year;
	let body_type = req.body.body_type;

	// make a function that will check if the transmission is valid and if it is a correct boolean. Make it so that i can check if it is given in the underlying if statement
	async function check_transmission(transmission) {
		// if the transmission is not given, return false
		if(transmission !== undefined || transmission !== null) {
			// if the transmission is not a boolean, return false
			if(transmission == 0 || transmission == 1){
				return "is valid transmission";
			} else {
				return null;
			}
		}
	}

	if(!build_year || !brand || !model || !trunk_space || !seats || !doors || !fuel_type || !await check_transmission(transmission) || !towing_weight || !maximum_gross_weight || !body_type) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("INSERT INTO car_types (\
		brand, \
		model, \
		trunk_space, \
		seats, \
		doors, \
		fuel, \
		transmission,\
		towing_weight, \
		maximum_gross_weight, \
		build_year, \
		body_type \
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
		brand,
		model,
		trunk_space,
		seats,
		doors,
		fuel_type,
		transmission,
		towing_weight,
		maximum_gross_weight,
		build_year,
		body_type
	], function (err, result) {
		if (err) {
			send_error(err, "Trying to add car");
		} else {
			res.send({ status: 200, message: "Car type added" });
		}
	});
});

// post /cars/add/car (create a new car)


// put /cars/update/car (update a car)

// put /cars/update/type (update a car type)

// delete /cars/delete/type (delete a car type)

// delete /cars/delete/car (delete a car)



module.exports = router;
