// require the needed modules
var express = require("express");
var { send_error } = require("../../functions/error");
var {
	check_user_token,
	check_permission
} = require("../../functions/middleware");
var { rentCar } = require("../../functions/cars.js");

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
        let models = await query("SELECT * FROM car_types");

        // Fetch fuel type and body type for each car type
        for (let car of result) {
            let carType = models.find((type) => type.id === car.car_type);
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

        res.json({status: 200, message: "Successfully fethed all cars", data: result});
    } catch (err) {
        send_error(res, err);
    }
});

// get /cars/bodytypes/{name} (all cars in type {type})
router.get("/bodytypes/:name", async function (req, res) {
    try {
        // Fetch all car body types
		console.log("Fetching all car body types with name: " + req.params.name)
		let bodytypes = await query("SELECT * FROM body_types WHERE type = ?", [req.params.name]);

		if (bodytypes.length === 0) {
			res.status(404).send({ status: 404, message: "Model not found" });
			return;
		}

		// fetch all models with the body type id
		let models = await query("SELECT * FROM car_types WHERE body_type = ?", [bodytypes[0].id]);

		if(models.length === 0) {
			res.status(404).send({ status: 404, message: "No cars found using this body type." });
			return;
		}

		models.forEach(function (
			car_type,
			index,
			array
		) {
			array[index] = car_type.id;
		});

		// get all cars with the car_type ids
		let result = await query("SELECT * FROM cars WHERE car_type IN (?)", [models]);

		if(result.length === 0) {
			res.status(404).send({ status: 404, message: "No cars found using this body type." });
			return;
		}

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

        res.json({status: 200, message: "Successfully fethed all cars", data: result});
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

		res.json({status: 200, message: "Successfully fethed car", data: result});
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
		res.send({status: 200, message: "Successfully fetched fuel types", data: result});
	});
});

// get /cars/types (all car types)
router.get("/models", function (req, res) {
	db.query("SELECT * FROM car_types", function (err, result) {
		if (err) {
			send_error(res, err);
		}
		res.json({status: 200, message: "Successfully fetched car types", data: result});
	});
});

// get /cars/bodytypes (all body types)
router.get("/bodytypes", function (req, res) {
	db.query("SELECT * FROM body_types", function (err, result) {
		if (err) {
			send_error(res, err);
		}
		res.json({status: 200, message: "Successfully fetched body types", data: result});
	});
});

// post /cars/add/type (create a new type of car)
router.post("/add/cartype", check_user_token, check_permission("ADD_REMOVE_VEHICLES"), async function (req, res) {
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

	if(towing_weight === null || towing_weight === 0){
		towing_weight = null;
	}

	if(!build_year){
		res.status(400).send({ status: 400, message: "Missing build_year" });
		return;
	} else if(!brand) {
		res.status(400).send({ status: 400, message: "Missing brand" });
		return;
	} else if (!model){
		res.status(400).send({ status: 400, message: "Missing model" });
		return;
	} else if(!trunk_space){
		res.status(400).send({ status: 400, message: "Missing trunk_space" });
		return;
	} else if(!seats){
		res.status(400).send({ status: 400, message: "Missing seats" });
		return;
	} else if(!doors){
		res.status(400).send({ status: 400, message: "Missing doors" });
		return;
	} else if(!fuel_type){
		res.status(400).send({ status: 400, message: "Missing fuel_type" });
		return;
	} else if(!await check_transmission(transmission)){
		res.status(400).send({ status: 400, message: "Missing transmission" });
		return;
	} else if(!towing_weight && towing_weight !== null){
		res.status(400).send({ status: 400, message: "Missing towing_weight" });
		return;
	} else if(!maximum_gross_weight){
		res.status(400).send({ status: 400, message: "Missing maximum_gross_weight" });
		return;
	} else if(!body_type){
		res.status(400).send({ status: 400, message: "Missing body_type" });
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
router.post("/add/car", check_user_token, check_permission("ADD_REMOVE_VEHICLES"), async function (req, res) {
	let car_type = req.body.car_type;
	let description = req.body.description;
	let license_plate = req.body.license_plate;
	let color = req.body.color;
	let price_per_day = req.body.price_per_day;
	let picture_url = req.body.picture_url;
	let location = req.body.location;

	if (car_type == undefined || license_plate == undefined || color == undefined || price_per_day == undefined || picture_url == undefined || location == undefined || description == undefined) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	let car_types = await query("SELECT * FROM car_types WHERE id = " + car_type);
	let locations = await query("SELECT * FROM locations WHERE id = " + location);

	if(locations.length === 0) {
		res.status(400).send({ status: 400, message: "Location not found" });
		return;
	}

	if(car_types.length === 0) {
		res.status(400).send({ status: 400, message: "Car type not found" });
		return;
	}

	// make the picture_url an array of urls split by ,
	picture_url = picture_url.split(",");

	db.query("INSERT INTO cars ( \
		car_type, \
		license_plate, \
		description, \
		color, \
		price_per_day, \
		picture_url, \
		location \
	) VALUES (?, ?, ?, ?, ?, ?, ?)", [
		car_type,
		license_plate,
		description,
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

// post /cars/add/bodytype (create a new car)
router.post("/add/bodytype", check_user_token, check_permission("ADD_REMOVE_VEHICLES"), function (req, res) {
	let body_type = req.body.body_type;

	if (!body_type) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("INSERT INTO body_types (type) VALUES (?)", [body_type], function (err, result) {
		if (err) {
			send_error(err, "Trying to add body type");
		} else {
			res.send({ status: 200, message: "Body type added" });
		}
	});
});



// post /cars/rent/{carId} (let the user rent a car)
router.post("/rent/:carId", check_user_token, check_permission("REQUEST_RENTAL"), async function(req, res, next) {
	let carId = req.params.carId;
	let user_id;
	
	let from_date_month = req.body.from_date_month;
	let from_date_year = req.body.from_date_year;
	let from_date_day = req.body.from_date_day;

	if(!from_date_day || !from_date_month || !from_date_year){
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
        return;
    }
	
	let from_date = `${from_date_year}-${from_date_month}-${from_date_day}`;

	let to_date_month = req.body.to_date_month;
	let to_date_year = req.body.to_date_year;
	let to_date_day = req.body.to_date_day;

	if(!to_date_day || !to_date_month || !to_date_year){
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
	}

	let to_date = `${to_date_year}-${to_date_month}-${to_date_day}`;

    if (!carId || !from_date || !to_date) {
        res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
        return;
    }

	let bearer_token = req.headers["authorization"]
	let token = bearer_token.split(" ");
	token = token[1];

	// get user id:
	let user = await query("SELECT * FROM users WHERE token = ?", [token]);
	user = user[0];
	user_id = user.id;
	

	await rentCar(user_id, carId, from_date, to_date, (data) => {
		res.json(data);
	});
});

// put /cars/update/car/{carId} (update a car)
router.put("/update/car/:id",check_user_token, check_permission("EDIT_VEHICLES"), function (req, res) {
	let id = req.params.id;
	let car_type = req.body.car_type;
	let license_plate = req.body.license_plate;
	let description = req.body.description;
	let color = req.body.color;
	let price_per_day = req.body.price_per_day;
	let picture_url = req.body.picture_url;
	let location = req.body.location;

	if (car_type == undefined || license_plate == undefined || color == undefined || price_per_day == undefined || picture_url == undefined || location == undefined || description == undefined) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	// make the picture_url an array of urls split by ,
	picture_url = picture_url.split(",");

	db.query("UPDATE cars SET \
		car_type = ?, \
		license_plate = ?, \
		description = ?, \
		color = ?, \
		price_per_day = ?, \
		picture_url = ?, \
		location = ? \
		WHERE id = ?", 
	[
		car_type,
		license_plate,
		description,
		color,
		price_per_day,
		`${picture_url}`,
		location,
		id
	], function (err, result) {
		if (err) {
			send_error(err, "Trying to update car");
		} else {
			res.send({ status: 200, message: "Car updated" });
		};
	});
});

// put /cars/update/type/{typeId} (update a car type)
router.put("/update/type/:id", check_user_token, check_permission("EDIT_VEHICLES"), async function (req, res) {
	let id = req.body.id;
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

	if(!id || !build_year || !brand || !model || !trunk_space || !seats || !doors || !fuel_type || !await check_transmission(transmission) || !towing_weight || !maximum_gross_weight || !body_type) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("UPDATE car_types SET \
		brand = ?, \
		model = ?, \
		trunk_space = ?, \
		seats = ?, \
		doors = ?, \
		fuel = ?, \
		transmission = ?, \
		towing_weight = ?, \
		maximum_gross_weight = ?, \
		build_year = ?, \
		body_type = ? \
		WHERE id = ?",
	[
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
		body_type,
		id
	], function (err, result) {
		if (err) {
			send_error(err, "Trying to update car type");
		} else {
			res.send({ status: 200, message: "Car type updated" });
		}
	});
});

// put /cars/update/carstatus (Updates a cars status)
router.put("/update/car/:id/status", check_user_token, check_permission("CHANGE_STATUS"), function (req, res) {
	let id = req.params.id;
	let status = req.body.status;

	if (!id || status !== 0 && status !== 1) {
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("UPDATE cars SET car_available = ? WHERE id = ?", [status, id], function (err, result) {
		if (err) {
			send_error(err, "Trying to update car status");
		} else {
			res.send({ status: 200, message: "Car status updated" });
		}
	});
});

// delete /cars/remove/bodytype/:id (remove a body type
router.delete("/remove/bodytype/:id", function (req, res, next) {
	let id = req.params.id;
	if(!id){
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("DELETE FROM body_types WHERE id = ?", [id], function (err, result) {
		if (err) {
			send_error(err, "Trying to remove body type");
		} else {
			res.send({ status: 200, message: "Body type removed" });
		}
	});
});

// delete /cars/remove/cartype/:id (remove a car type)
router.delete("/remove/cartype/:id", function (req, res, next) {
	let id = req.params.id;
	if(!id){
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("DELETE FROM car_types WHERE id = ?", [id], function (err, result) {
		if (err) {
			send_error(err, "Trying to remove car type");
		} else {
			res.send({ status: 200, message: "Car type removed" });
		}
	});
});

// delete /cars/remove/car/:id (remove a car)
router.delete("/remove/car/:id", function (req, res, next) {
	let id = req.params.id;
	if(!id){
		res.status(400).send({ status: 400, message: "Missing or incorrect parameters" });
		return;
	}

	db.query("DELETE FROM cars WHERE id = ?", [id], function (err, result) {
		if (err) {
			send_error(err, "Trying to remove car");
		} else {
			res.send({ status: 200, message: "Car removed" });
		}
	});
});


module.exports = router;
