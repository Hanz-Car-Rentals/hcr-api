// require the needed modules
var express = require('express');
var db = require('../../db');
var crypto = require('crypto');
var { newUser, forgot_password } = require('../../functions/email');
var { send_error } = require('../../functions/error');
var { check_user_token, admin_check, } = require('../../functions/middleware');

// create the router
var router = express.Router();

// User routes
router.get('/', check_user_token, admin_check, function(req, res, next){
  db.query('SELECT id,email,email_verified,first_name,last_name,admin,times_rented,currently_renting FROM users', function (error, results, fields) {
      if (error) {
          send_error(error, "Error fetching users");
          res.send({'status':500, 'message': 'Error fetching users'});
      } else {
          res.status(200).send(results);
      }
  });
});

router.get('/user/:id', check_user_token, admin_check, function(req, res, next){
    db.query('SELECT id,email,email_verified,first_name,last_name,admin,times_rented,currently_renting FROM users WHERE id = ?', [req.params.id], function (error, results, fields) {
        if (error) {
            send_error(error, "Error fetching user");
            res.send({'status':500, 'message': 'Error fetching user'});
        } else {
            res.status(200).send(results);
        }
    });
});

router.post('/add', function(req, res, next){
  let first_name = req.body.fname;
  let last_name = req.body.lname;
  let email = req.body.email;
  let password = req.body.password;

  const salt = crypto.randomBytes(16);

  crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return next(err); }
      if (first_name && last_name && email && password) {
          db.query('INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)', [first_name, last_name, email, hashedPassword, salt], function (error, results, fields) {
          if (error) {
            if(error.code === 'ER_DUP_ENTRY') {
                res.status(403).send({'status':403, 'message': 'Email already in use'});
                return;
            } else {
                send_error(error, "Error creating new user");
                res.send({'status':500, 'message': 'Error creating user'});
            }
          } else {
              if (err) { return next(err); }
              newUser(first_name, email, results.insertId, req.headers.host);
              res.send({'status':200, 'message': 'User created successfully'});
          }
          });
      }
      else {
          res.status(400).send({'status':400, 'message': 'Bad Request'});
      }
  });
});

router.put('/update/:id', check_user_token, function(req, res, next){
    let id = req.params.id;
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let email = req.body.email;
    let admin = req.body.admin;

    if (first_name && last_name && email && admin) {
        db.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, admin = ? WHERE id = ?', [first_name, last_name, email, admin, id], function (error, results, fields) {
            if (error) {
                if(error.code === 'ER_DUP_ENTRY') {
                    res.status(403).send({'status':403, 'message': 'Email already in use'});
                    return;
                } else {
                    send_error(error, "Error creating new user");
                    res.status(500).send({'status':500, 'message': 'Error creating user'});
                }
            } else {
                res.send({'status':200, 'message': 'User updated successfully'});
            }
        });
    }
    else {
        res.send({'status':400, 'message': 'Invalid request'});
    }
});

router.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            send_error(error, "Error logging in");
            res.send({'status':500, 'message': 'Error logging in'});
        } else {
            if (results.length < 1) {
                res.send({'status':401, 'message': 'Invalid email or password'});
            } else {
                let user = results[0];
                crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                    if (err) { 
                        send_error(err, 'Error login');
                        throw err;
                    }
                    if (hashedPassword.equals(user.password)) {
                        let token = crypto.randomBytes(16).toString('hex');
                        db.query('UPDATE users SET token = ? WHERE id = ?', [token, user.id], function (error, results, fields) {
                            if (error) {
                                send_error(error, "Error logging in");
                                res.send({'status':500, 'message': 'Error logging in'});
                            } else {
                                res.send({'status':200,'message': 'Logged in successfully', 'token': token, 'user': { "admin": user.admin, "id": user.id}});
                            }
                        });
                    } else {
                        res.send({'status':401, 'message': 'Invalid email or password'});
                    }
                });
            }
        }
    });
});

router.get('/verify/:token', function(req, res, next){
    db.query('SELECT * FROM users WHERE email_verify_token = ?', [req.params.token], function(err, rows) {
        if(err) {
            send_error(err, 'email_verify_token find');
            throw err;
        };
        if(rows.length < 1) return res.send({'status':"400", "message":"Invalid Token"});
        let dbuser = rows[0];
        db.query('UPDATE users SET email_verified = true, email_verify_token = NULL WHERE id = ?', [dbuser.id], function(err, rows) {
            if(err) {
                send_error(err, 'email_verify_token update');
                throw err;
            };
            return res.send({'status':200, 'message':"Email verified successfully"});
        });
    });
});

router.post('/reset_password', async function(req, res, next) {
    const email = req.body.email;
    db.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows) {
        if(err) {
            send_error(err, 'Password reset e-mail find');
            throw err;
        };
        if(rows.length < 1) return res.send({'status':401, "message":"Invalid E-mail"});
        let dbuser = rows[0];
        forgot_password(email, dbuser.id, req.headers.host);
        return res.send({'status':200, "message":"Password reset e-mail sent"});
    });
});

module.exports = router;