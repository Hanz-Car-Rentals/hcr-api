// require the needed modules
var express = require("express");
var { send_error } = require("../../functions/error");
var { send_mail } = require("../../functions/email");
var {
  check_user_token,
  check_permission,
  check_user_permission,
} = require("../../functions/middleware");

// create the router
var router = express.Router();


// get all logs
router.get("/", check_user_token, check_permission("VIEW_LOGS"), function(req, res, next){
    db.query("SELECT * FROM logs", function(err, results){
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
    db.query("SELECT * FROM logs WHERE car_id = ?", [carid], function(err, results){
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
    db.query("SELECT * FROM logs WHERE user_id = ?", [userid], function(err, results){
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
    db.query("SELECT * FROM logs WHERE status = 1", function(err, results){
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
    db.query("SELECT * FROM logs WHERE status = 2", function(err, results){
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
    db.query("SELECT * FROM logs WHERE status = 3", function(err, results){
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
    let staffMember = await query("SELECT * FROM users WHERE token = ?", [req.headers["authorization"].split(" ")[1]]);
    let staffId = staffMember[0].id;
    db.query("UPDATE logs SET status = 2, staff_id=? WHERE id = ?", [staffId,logId], async function(err, results){
        if (err){
            send_error(err, "Error accepting log");
            res.status(500).send({status: 500, message: "Error accepting log"});
        } else {
            let log_user = await query("SELECT * FROM logs WHERE id = ?", [logId]);
            let user_data = await query("SELECT * FROM users WHERE id = ?", [log_user[0].user_id])
            send_mail(user_data[0].email, `Dear, ${user_data[0].first_name},\n\nWe have some great news!\nYour request to rent a car has been accepted. You can now come to our office to pick up your car.\n\nBest regards,\nHanz Car Rentals`, "Request approved!")

            res.send({status: 200, message: "Log accepted"});
        }
    });
});

// deny a request
router.post("/deny/:logId", check_user_token, check_permission("ACCEPT_DENY_REQUEST"), async function(req, res, next){
    let logId = req.params.logId;
    let staffMember = await query("SELECT * FROM users WHERE token = ?", [req.headers["authorization"].split(" ")[1]]);
    let staffId = staffMember[0].id;
    db.query("UPDATE logs SET status = 3, staff_id = ? WHERE id = ?", [staffId,logId], async function(err, results){
        if (err){
            send_error(err, "Error denying log");
            res.status(500).send({status: 500, message: "Error denying log"});
        } else {
            let log_user = await query("SELECT * FROM logs WHERE id = ?", [logId]);
            let user_data = await query("SELECT * FROM users WHERE id = ?", [log_user[0].user_id])
            send_mail(user_data[0].email, `Dear, ${user_data[0].first_name},\n\nWe have some sad news.\nYour request to rent a car has been denied. If you want to know why we denied it, you can ask here: contact.hcr@wolfsoft.soltuions\n\nBest regards,\nHanz Car Rentals`, "Request denied")

            res.send({status: 200, message: "Log denied"});
        }
    });
});

// export the router
module.exports = router;
