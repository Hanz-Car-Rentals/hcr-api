// require the needed modules
var express = require("express");
var db = require("../../../db");
var { send_error } = require("../../../functions/v2/error");
var {
  check_user_token,
  user_check,
} = require("../../../functions/v2/middleware");

// create the router
var router = express.Router();

// the route for posting a review
router.post("/add", check_user_token, function(req, res, next){
    let token = req.headers['authorization'];
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