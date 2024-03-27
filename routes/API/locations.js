// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var { send_mail } = require("../../functions/email");
var { query } = require("../../functions/database_queries");
var {
  check_user_token,
  user_check,
  check_permission,
  check_user_permission,
} = require("../../functions/middleware");

// create the router
var router = express.Router();

router.get("/", function (req, res) {
    db.query("SELECT * FROM locations", function (err, results) {
        if (err) {
        send_error(err, "Error getting locations");
        res.status(500).send({ status: 500, message: "Error getting locations" });
        } else {
        res.send({ status: 200, message: "Locations", data: results });
        }
    });
});

// get location by id
router.get("/location/:id", function (req, res) {
    let id = req.params.id;
    db.query("SELECT * FROM locations WHERE id = ?", [id], function (err, results) {
        if (err) {
        send_error(err, "Error getting location");
        res.status(500).send({ status: 500, message: "Error getting location" });
        } else {
        res.send({ status: 200, message: "Location", data: results });
        }
    });
});

// get location by name
router.get("/name/:name", function (req, res) {
    let name = req.params.name;
    db.query("SELECT * FROM locations WHERE location = ?", [name], function (err, results) {
        if (err) {
        send_error(err, "Error getting location");
        res.status(500).send({ status: 500, message: "Error getting location" });
        } else {
        res.send({ status: 200, message: "Location", data: results });
        }
    });
});

// add a location
router.post("/add", function (req, res) {
    let location = req.body.location;
    let picture_url = req.body.picture_url;
    let description = req.body.description;
    let phone_number = req.body.phone_number;
    let address = req.body.address;
    db.query(
        "INSERT INTO locations (location, picture_url, description, phone_number, address) VALUES (?, ?, ?, ?, ?)",
        [location, picture_url, description, phone_number, address],
        function (err, results) {
            if (err) {
                send_error(err, "Error adding location");
                res.status(500).send({ status: 500, message: "Error adding location" });
            } else {
                res.send({ status: 200, message: "Location added", data: results });
            }
        }
    );
});

// update a location
router.put("/update/:id", function (req, res) {
    let id = req.params.id;
    let location = req.body.location;
    let picture_url = req.body.picture_url;
    let description = req.body.description;
    let phone_number = req.body.phone_number;
    let address = req.body.address;
    db.query(
        "UPDATE locations SET location = ?, picture_url = ?, description = ?, phone_number = ?, address = ? WHERE id = ?",
        [location, picture_url, description, phone_number, address, id],
        function (err, results) {
            if (err) {
                send_error(err, "Error updating location");
                res.status(500).send({ status: 500, message: "Error updating location" });
            } else {
                res.send({ status: 200, message: "Location updated", data: results });
            }
        }
    );
});

// delete a location
router.delete("/delete/:id", function (req, res) {
    let id = req.params.id;
    db.query("DELETE FROM locations WHERE id = ?", [id], function (err, results) {
        if (err) {
            send_error(err, "Error deleting location");
            res.status(500).send({ status: 500, message: "Error deleting location" });
        } else {
            res.send({ status: 200, message: "Location deleted", data: results });
        }
    });
});

// export the router
module.exports = router;
