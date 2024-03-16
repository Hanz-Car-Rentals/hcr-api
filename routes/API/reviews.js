// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  user_check,
  checkPermission,
} = require("../../functions/middleware");

// create the router
var router = express.Router();

// the route for posting a review
router.post("/add", check_user_token, checkPermission("POST_REVIEW"), function(req, res, next){
    let token = req.headers['authorization'];
    if(!token) return res.status(401).send({
        status: 401,
        message: "Unauthorized"
    })
    token = token.split(" ");
    db.query("SELECT * FROM users WHERE token = ?", [token[1]], function(err, results){
        let userId = results[0].id;
        let rating = req.body.rating;
        let review = req.body.review;
        let carId = req.body.car_id;

        db.query("INSERT INTO reviews (user_id, rating, review, car_id) VALUES (?, ?, ?, ?)", [userId, rating, review, carId], function(err, results){
            if (err){
                send_error(err, "Error adding review");
                res.status(500).send({status: 500, message: "Error adding review"});
            } else {
                res.send({status: 200, message: "Review added"});
            }
        });
    });
});

// /reviews the route to view all the reviews
router.get("/", function(req, res, next){
    db.query("SELECT * FROM reviews", function(err, results){
        if (err){
            send_error(err, "Error getting reviews");
            res.status(500).send({status: 500, message: "Error getting reviews"});
        } else {
            res.send({status: 200, message: "Reviews", data: results});
        }
    });
});

// /reviews/car/{carId} the route for getting all reviews for a car
router.get("/car/:carId", function(req, res, next){
    let carId = req.params.carId;
    db.query("SELECT * FROM reviews WHERE car_id = ?", [carId], function(err, results){
        if (err){
            send_error(err, "Error getting reviews");
            res.status(500).send({status: 500, message: "Error getting reviews"});
        } else {
            res.send({status: 200, message: "Reviews", data: results});
        }
    });
});

// /reviews/user/{userId} the route for getting all reviews that the users posted
router.get("/user/:userId", function(req, res, next){
    let userId = req.params.userId;
    db.query("SELECT * FROM reviews WHERE user_id = ?", [userId], function(err, results){
        if (err){
            send_error(err, "Error getting reviews");
            res.status(500).send({status: 500, message: "Error getting reviews"});
        } else {
            res.send({status: 200, message: "Reviews", data: results});
        }
    });
});

module.exports = router;
