// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
	check_user_token,
	user_check,
	checkPermission
} = require("../../functions/middleware");
var { query } = require("../../functions/database_queries");

// create the router
var router = express.Router();

// get /cars (all cars)
router.get("/", async function (req, res) {
    try {
        // Fetch all cars
        let result = await query("SELECT * FROM cars");

        // Process picture_url to an array
        result.forEach((car) => {
            car.picture_url = car.picture_url.split(",");
        });

        // Fetch all locations
        let locations = await query("SELECT * FROM locations");

        // Map location id to location name for each car
        result.forEach((car) => {
            let location = locations.find((loc) => loc.id === car.location);
            if (location) {
                car.location = location.location;
            }
        });

        // Fetch all car types
        let carTypes = await query("SELECT * FROM car_types");

        // Fetch fuel type and body type for each car type
        for (let car of result) {
            let carType = carTypes.find((type) => type.id === car.car_type);
            if (carType) {
                // Fetch fuel type
                let fuelType = await query("SELECT * FROM fuel_types WHERE id = ?", [carType.fuel]);
                if (fuelType.length > 0) {
                    carType.fuel = fuelType[0].type;
                }

                // Fetch body type
                let bodyType = await query("SELECT * FROM body_types WHERE id = ?", [carType.body_type]);
                if (bodyType.length > 0) {
                    carType.body_type = bodyType[0].type;
                }

                car.car_type = carType;
            }
        }

        res.send(result);
    } catch (err) {
        send_error(res, err);
    }
});

// get /cars/:id (car by id)
router.get("/car/:id", async function (req, res) {
	try {
		let id = req.params.id;

		// Fetch car by id
		let result = await query("SELECT * FROM cars WHERE id = ?", [id]);
		if (result.length === 0) {
			res.status(404).send({ status: 404, message: "Car not found" });
			return;
		}
		result = result[0];

		// Process picture_url to an array
		result.picture_url = result.picture_url.split(",");

		// Fetch location
		let location = await query("SELECT * FROM locations WHERE id = ?", [result.location]);
		if (location.length > 0) {
			result.location = location[0].location;
		}

		// Fetch car type
		let carType = await query("SELECT * FROM car_types WHERE id = ?", [result.car_type]);
		if (carType.length > 0) {
			// Fetch fuel type
			let fuelType = await query("SELECT * FROM fuel_types WHERE id = ?", [carType[0].fuel]);
			if (fuelType.length > 0) {
				carType[0].fuel = fuelType[0].type;
			}

			// Fetch body type
			let bodyType = await query("SELECT * FROM body_types WHERE id = ?", [carType[0].body_type]);
			if (bodyType.length > 0) {
				carType[0].body_type = bodyType[0].type;
			}

			result.car_type = carType[0];
		}

		res.send(result);
	} catch (err) {
		send_error(res, err);
	}
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
router.post("/add/car", check_user_token, checkPermission("ADD_REMOVE_VEHICLES"), function (req, res) {
	let car_type = req.body.car_type;
	let license_plate = req.body.license_plate;
	let color = req.body.color;
	let price_per_day = req.body.price_per_day;
	let picture_url = req.body.picture_url;
	let location = req.body.location;

	if (car_type == undefined || license_plate == undefined || color == undefined || price_per_day == undefined || picture_url == undefined || location == undefined) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	// make the picture_url an array of urls split by ,
	picture_url = picture_url.split(",");

	db.query("INSERT INTO cars ( \
		car_type, \
		license_plate, \
		color, \
		price_per_day, \
		picture_url, \
		location \
	) VALUES (?, ?, ?, ?, ?, ?)", [
		car_type,
		license_plate,
		color,
		price_per_day,
		`${picture_url}`,
		location
	], function (err, result) {
		if (err) {
			send_error(err, "Trying to add car");
		} else {
			res.send({ status: 200, message: "Car added" });
		}
	});
});


// put /cars/update/car (update a car)


// put /cars/update/type (update a car type)


// delete /cars/delete/type (delete a car type)


// delete /cars/delete/car (delete a car)



module.exports = router;
