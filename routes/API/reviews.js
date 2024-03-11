// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  admin_check,
  user_check,
} = require("../../functions/middleware");

// create the router
var router = express.Router();

// the route for posting a review
router.post("/add", function(req, res, next){
    let token = req.headers['authorization'];
    if(!token){
        return res.status(400).json({
            status: 400,
            message: "No token provided"
        });
    };
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

module.exports = router;
