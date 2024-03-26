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

// export the router
module.exports = router;
