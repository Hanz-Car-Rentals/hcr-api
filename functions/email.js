const nodemailer = require("nodemailer");
const config = require('../../configs/config.json');
const crypto = require('crypto');
let db = require('../../db');

const transporter = nodemailer.createTransport({
    host: config.email_server.host,
    port: config.email_server.port,
    secure: config.email_server.secure,
    auth: {
        user: config.email_server.auth.user,
        pass: config.email_server.auth.pass
    }
});

async function send_mail(email, text, subject){
    await transporter.sendMail({
        from: config.email_server.from,
        to: email,
        subject: subject,
        text: text
    }).then(() => {
        console.log('Email sent to: ' + email + 'regarding: ' + subject);
    }).catch((err) => {
        if(err) throw err;
    });
}

async function newUser(email, id, host){
    var token = crypto.randomBytes(16).toString('hex');
    db.query('UPDATE users SET email_verify_token = ? WHERE id = ?', [token, id], function (err, rows) {
        if(err) throw err;

        let subject = 'Account Verification';
        let text = 'Please click the following link to verify your account: https://' + host + '/auth/verify/' + token;
    
        send_mail(email, text, subject);
    });
}

async function forgot_password(email, id, host){
    var token = crypto.randomBytes(16).toString('hex');
    db.query('UPDATE users SET password_reset_token = ?, reset_password_token_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?', [token, id], function (err, rows) {
        if(err) throw err;

        let subject = 'Reset Password';
        let text = 'Please click the following link to reset your password: https://' + host + '/auth/reset_pass/' + token;
     
        send_mail(email, text, subject);
    });
}

module.exports = {
    newUser,
    forgot_password
}