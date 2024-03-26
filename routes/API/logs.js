// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var { send_mail } = require("../../functions/email");
var { query } = require("../../functions/database_queries");
var {
  check_user_token,
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
router.get("/user/:userId", check_user_token, check_user_permission("view_logs", "VIEW_LOGS"), function(req, res, next){
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
router.get("/approved", check_user_token, check_permission("VIEW_LOGS"), function(req, res, next){
    db.query("SELECT * FROM log WHERE status = 2", function(err, results){
        if (err){
            send_error(err, "Error getting logs");
            res.status(500).send({status: 500, message: "Error getting logs"});
        } else {
            res.send({status: 200, message: "Logs", data: results});
        }
    });
});

// get denied logs
router.get("/denied", check_user_token, check_permission("VIEW_LOGS"), function(req, res, next){
    db.query("SELECT * FROM log WHERE status = 3", function(err, results){
        if (err){
            send_error(err, "Error getting logs");
            res.status(500).send({status: 500, message: "Error getting logs"});
        } else {
            res.send({status: 200, message: "Logs", data: results});
        }
    });
});

// accept a request
router.post("/accept/:logId", check_user_token, check_permission("ACCEPT_DENY_REQUEST"), async function(req, res, next){
    let logId = req.params.logId;
    db.query("UPDATE log SET status = 2 WHERE id = ?", [logId], async function(err, results){
        if (err){
            send_error(err, "Error accepting log");
            res.status(500).send({status: 500, message: "Error accepting log"});
        } else {
            let log_user = await query("SELECT * FROM log WHERE id = ?", [logId]);
            let user_data = await query("SELECT * FROM users WHERE id = ?", [log_user[0].user_id])
            console.log(user_data[0].email);
            send_mail(user_data[0].email, `Dear, ${user_data[0].first_name},\n\nWe have some great news!\nYour request to rent a car has been accepted. You can now come to our office to pick up your car.\n\nBest regards,\nHanz Car Rentals`, "Request approved!")

            res.send({status: 200, message: "Log accepted"});
        }
    });
});

// deny a request
router.post("/deny/:logId", check_user_token, check_permission("ACCEPT_DENY_REQUEST"), async function(req, res, next){
    let logId = req.params.logId;
    db.query("UPDATE log SET status = 3 WHERE id = ?", [logId], async function(err, results){
        if (err){
            send_error(err, "Error denying log");
            res.status(500).send({status: 500, message: "Error denying log"});
        } else {
            let log_user = await query("SELECT * FROM log WHERE id = ?", [logId]);
            let user_data = await query("SELECT * FROM users WHERE id = ?", [log_user[0].user_id])
            console.log(user_data[0].email);
            send_mail(user_data[0].email, `Dear, ${user_data[0].first_name},\n\nWe have some sad news.\nYour request to rent a car has been denied. If you are not happy with this please send us an email to: contact.hcr@wolfsoft.soltuions\n\nBest regards,\nHanz Car Rentals`, "Request denied")

            res.send({status: 200, message: "Log denied"});
        }
    });
});

// export the router
module.exports = router;
