// require the needed modules
var express = require("express");
var { send_error } = require("../../functions/error");
var { contact_mail } = require("../../functions/email");

// create the router
var router = express.Router();

router.post("/send", function(req, res, next) {
    let name = req.body.name;
    let email = req.body.email;
    let subject = req.body.subject;
    let message = req.body.message;

    contact_mail(
        email,
        subject,
        `Name: ${name}\n\nMessage:\n${message}`
    );

    res.json({
        status: 200,
        message: "Message sent"
    })
});

// export the router
module.exports = router;
