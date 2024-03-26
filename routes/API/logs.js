// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  user_check,
  check_permission,
  check_user_permission,
} = require("../../functions/middleware");

// create the router
var router = express.Router();


// get all logs
router.get("/", check_user_token, check_permission("VIEW_LOGS"), function(req, res, next){
    db.query("SELECT * FROM log", function(err, results){
        if (err){
            send_error(err, "Error getting logs");
            res.status(500).send({status: 500, message: "Error getting logs"});
        } else {
            res.send({status: 200, message: "Logs", data: results});
        }
    });
});

// get log by carid
router.get("/car/:carid", check_user_token, check_permission("VIEW_LOGS"), function(req, res, next){
    let carid = req.params.carid;
    db.query("SELECT * FROM log WHERE car_id = ?", [carid], function(err, results){
        if (err){
            send_error(err, "Error getting logs");
            res.status(500).send({status: 500, message: "Error getting logs"});
        } else {
            res.send({status: 200, message: "Logs", data: results});
        }
    });
});

// get log by userid
router.get("/user/:userId", check_user_token, check_user_permission("view_logs", ), function(req, res, next){
    let userid = req.params.userId;
    db.query("SELECT * FROM log WHERE user_id = ?", [userid], function(err, results){
        if (err){
            send_error(err, "Error getting logs");
            res.status(500).send({status: 500, message: "Error getting logs"});
        } else {
            res.send({status: 200, message: "Logs", data: results});
        }
    });
});

// get pending logs
router.get("/pending", check_user_token, check_permission("VIEW_LOGS"), function(req, res, next){
    db.query("SELECT * FROM log WHERE status = 1", function(err, results){
        if (err){
            send_error(err, "Error getting logs");
            res.status(500).send({status: 500, message: "Error getting logs"});
        } else {
            res.send({status: 200, message: "Logs", data: results});
        }
    });
});

// get approved logs

// get denied logs

// export the router
module.exports = router;
