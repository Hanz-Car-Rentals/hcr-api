// require the needed modules
var express = require('express');
var db = require('../../db');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var { newUser, forgot_password } = require('../../functions/email');
var { send_error } = require('../../functions/error');
var { check_user_token, admin_check, user_check } = require('../../functions/middleware');

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

router.get('/user/:id', check_user_token, user_check, function(req, res, next){
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

router.put('/update/:id', check_user_token, user_check, function(req, res, next){
    let id = req.params.id;
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let email = req.body.email;

    if (first_name && last_name && email && id) {
        db.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, WHERE id = ?', [first_name, last_name, email, id], function (error, results, fields) {
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


// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    // Query to fetch user details by email
    const getUserQuery = `SELECT * FROM users WHERE email = ?`;
  
    db.query(getUserQuery, [email], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      // Check if user exists
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = results[0];
  
      // Check if the password is retrieved properly
      if (!user.password) {
        return res.status(500).json({ message: 'Password not found for the user' });
      }
  
      // Compare password
      const storedPassword = user.password.toString().trim(); // Convert to string and trim
      const providedPassword = password.toString().trim(); // Convert to string and trim
      
      // Hash provided password before comparison
      const providedPasswordHash = bcrypt.hashSync(providedPassword, 10);
      
      bcrypt.compare(providedPasswordHash, storedPassword, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid password' });
        }
  
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
  
        // Return user data and token
        res.status(200).json({
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
            // Add other fields as needed
          },
          token
        });
      });
    });
  });



// router.post('/login', function (req, res) {
//     let email = req.body.email;
//     let password = req.body.password;

//     db.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
//         if (error) {
//             send_error(error, "Error logging in");
//             res.send({'status':500, 'message': 'Error logging in'});
//         } else {
//             if (results.length < 1) {
//                 res.send({'status':401, 'message': 'Invalid email or password'});
//             } else {
//                 // get the salt from the salts table where the user_id is the users id.
//                 let user = results[0];
//                 db.query("SELECT salt FROM users WHERE id = ?", [user.salt], function (error, results, fields) {
//                     if(error) throw error;
//                     let salt = results[0].salt;
//                     crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//                         if (err) { 
//                             send_error(err, 'Error login');
//                             throw err;
//                         }
//                         if (hashedPassword.equals(user.password)) {
//                             let token = crypto.randomBytes(16).toString('hex');
//                             db.query('UPDATE users SET token = ? WHERE id = ?', [token, user.id], function (error, results, fields) {
//                                 if (error) {
//                                     send_error(error, "Error logging in");
//                                     res.send({'status':500, 'message': 'Error logging in'});
//                                 } else {
//                                     // get the role_name from the roles table where the role.id = user.role
//                                     db.query('SELECT role_name FROM roles WHERE id = ?', [user.role], function (error, results, fields) {
//                                         if (error) {
//                                             send_error(error, "Error logging in");
//                                             res.send({'status':500, 'message': 'Error logging in'});
//                                         }
//                                         let role = results[0].role_name;
//                                         res.send({'status':200,'message': 'Logged in successfully', 'token': token, 'user': { "role": role, "id": user.id}});
//                                     });
//                                 }
//                             });
//                         } else {
//                             res.send({'status':401, 'message': 'Invalid email or password'});
//                         }
//                     });
//                 });
//             }
//         }
//     });
// });

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

router.post('/reset_password_email', async function(req, res, next) {
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

router.post('/reset_password', async function(req, res, next) {
    const password1 = req.body.password1;
    const password2 = req.body.password2;
    const token = req.body.email_token;

    if(password1 !== password2) {
        return res.status(400).send({'status':400, "message":"Passwords do not match"});
    };

    db.query('SELECT * FROM users WHERE password_reset_token = ? AND reset_password_token_expires_at > NOW()', [token], function(err, rows) {
        if(err) {
            send_error(err, 'Password reset e-mail find');
            throw err;
        };
        if(rows.length < 1) return res.send({'status':401, "message":"Invalid token"});
        let dbuser = rows[0];
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(password1, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) { 
                send_error(err, 'Error login');
                throw err;
            }
            db.query('UPDATE users SET password = ?, salt = ?, password_reset_token = NULL, reset_password_token_expires_at = NULL WHERE id = ?', [hashedPassword, salt, dbuser.id], function(err, rows) {
                if(err) {
                    send_error(err, 'password reset');
                    throw err;
                };
                return res.send({'status':200, "message":"Password reset successfully"});
            });
        });
    });
});

module.exports = router;