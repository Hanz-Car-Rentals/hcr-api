// require the needed modules
var express = require("express");
var db = require("../../db");
var crypto = require("crypto");
var { newUser, forgot_password } = require("../../functions/email");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  user_check,
  checkPermission
} = require("../../functions/middleware");

// create the router
var router = express.Router();

router.get('/', checkPermission('ADMIN'), function (req, res) {
  res.json({
    message: 'You have the permission to access this route'
  })
})

router.post("/login", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    function (error, results, fields) {
      if (error) {
        send_error(error, "Error logging in");
        res.send({ status: 500, message: "Error logging in" });
      } else {
        if (results.length < 1) {
          res.send({ status: 401, message: "Invalid email or password" });
        } else {
          let user = results[0];
          db.query(
            "SELECT * FROM salts WHERE id = ?",
            [user.salt],
            function (error, results, fields) {
              if (error) {
                send_error(error, "Error logging in");
                throw error;
              }
              if (results.length < 1) {
                res.send({ status: 401, message: "Invalid email or password" });
                return;
              }
              let salt = results[0].salt;
              crypto.pbkdf2(
                password,
                salt,
                310000,
                32,
                "sha256",
                function (err, hashedPassword) {
                  if (
                    hashedPassword.toString("hex") ==
                    user.password.toString("hex")
                  ) {
                    // Create a user token
                    let token = crypto.randomBytes(16).toString("hex");
                    db.query(
                      "UPDATE users SET token =?, token_expires_at = DATE_ADD(NOW(), INTERVAL 3 HOUR) WHERE id =?",
                      [token, user.id],
                      function (err, rows) {
                        if (err) {
                          send_error(err, "Updating token");
                          throw err;
                        }
                        // get the role info
                        db.query(
                          "SELECT * FROM roles WHERE id =?",
                          [user.role],
                          async function (error, results, fields) {
                            if (error) {
                              send_error(error, "Error logging in");
                              throw error;
                            }
                            if (results.length < 1) {
                              res.send({
                                status: 401,
                                message: "Invalid email or password",
                              });
                              return;
                            }
                            let role = results[0];
                            res.send({
                              status: 200,
                              message: "Successfully logged in",
                              user: {
                                first_name: user.first_name,
                                last_name: user.last_name,
                                token: token,
                                role: role.role_name,
                              },
                            });
                          }
                        );
                      }
                    );
                  } else {
                    res.send({
                      status: 401,
                      message: "Invalid email or password",
                    });
                  }
                  return;
                }
              );
            }
          );
        }
      }
    }
  );
});

// router.post("/add", function (req, res) {
//   let first_name = req.body.first_name;
//   let last_name = req.body.last_name;
//   let email = req.body.email;
//   let password = req.body.password;

//   const salt = crypto.randomBytes(16).toString("hex");
//   // Hash the password using the salt
//   crypto.pbkdf2(
//     password,
//     salt,
//     310000,
//     32,
//     "sha256",
//     function (err, hashedPassword) {
//       if (err) throw err;
//       // Insert the salt into the salts table
//       db.query(
//         "INSERT INTO salts (salt) VALUES (?)",
//         [salt],
//         function (err, result) {
//           if (err) throw err;

//           // Get the ID of the inserted salt
//           const saltId = result.insertId;

//           // Insert the user into the users table with the salt ID
//           db.query(
//             "INSERT INTO users (first_name, last_name, email, email_verified, password, salt, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
//             [first_name, last_name, email, 1, hashedPassword, saltId, 5],
//             function (err, result) {
//               if (err) throw err;
//               // Send the new user an email
//               newUser(first_name, email, result.insertId, req.headers.host);
//               res.send({ status: 200, message: "Successfully added user" });
//             }
//           );
//         }
//       );
//     }
//   );
// });

// // users route to get all users as admin user
// router.get("/", check_user_token, function (req, res) {
//   db.query(
//     "SELECT id,first_name,last_name,email,email_verified,role,verified_drivers_licence,times_rented,currently_renting,created_at,updated_at FROM users",
//     function (error, results, fields) {
//       if (error) {
//         send_error(error, "Error getting users");
//         res.send({ status: 500, message: "Error getting users" });
//       } else {
//         res.send({
//           status: 200,
//           message: "Successfully got users",
//           users: results,
//         });
//       }
//     }
//   );
// });

// // users/user/{id} route to get a single user
// router.get("/user/:id", check_user_token, user_check, function (req, res) {
//     db.query(
//         "SELECT id,first_name,last_name,email,email_verified,role,verified_drivers_licence,times_rented,currently_renting,created_at,updated_at FROM users WHERE id =?",
//         [req.params.id],
//         function (error, results, fields) {
//             if (error) {
//                 send_error(error, "Error getting user");
//                 res.send({ status: 500, message: "Error getting user" });
//             } else {
//                 // get the role info from the roles table:
//                 db.query(
//                 "SELECT * FROM roles WHERE id =?",
//                 [results[0].role],
//                 function (error, role_results, fields) {
//                     if (error) {
//                     send_error(error, "Error getting user");
//                     throw error;
//                     }
//                     if (role_results.length < 1) {
//                     res.send({ status: 500, message: "Error getting user" });
//                     return;
//                     }
//                     results[0].role = role_results[0];
//                     // get the currently_renting info from the cars table:
//                     if (results[0].currently_renting === null) {
//                         results[0].currently_renting = null;
//                     } else {
//                         db.query(
//                             "SELECT * FROM cars WHERE id =?",
//                             [results[0].currently_renting],
//                             function (error, car_results, fields) {
//                             if (error) {
//                                 send_error(error, "Error getting user");
//                                 throw error;
//                             }
//                             if (car_results.length < 1) {
//                                 res.send({ status: 500, message: "Error getting user" });
//                                 return;
//                             }
//                             results[0].currently_renting = car_results[0];
//                             }
//                         );
//                     }
//                     res.send({
//                     status: 200,
//                     message: "Successfully got user",
//                     user: results[0],
//                     });
//                 });
//             }
//         }
//     );
// });

// // users/reset_password_email this route will send an email to the given email address
// router.post("/reset_password_email", function (req, res) {
//     let email = req.body.email;
//     db.query(
//         "SELECT * FROM users WHERE email =?",
//         [email],
//         function (error, results, fields) {
//             if (error) {
//                 send_error(error, "Error sending reset password email");
//                 res.send({
//                 status: 500,
//                 message: "Error sending reset password email",
//                 });
//             } else {
//                 if (results.length < 1) {
//                     res.send({ status: 404, message: "Email not found" });
//                 } else {
//                     forgot_password(email, results[0].id, req.headers.host);
//                     res.send({
//                         status: 200,
//                         message: "Successfully sent reset password email",
//                     });
//                 }
//             }
//         }
//     );
// });

// // users/reset_password this route will reset the password for the given user
// router.post("/reset_password", function (req, res) {
//     let password = req.body.password;
//     let token = req.body.token;

//     const salt = crypto.randomBytes(16).toString("hex");
//     // Hash the password using the salt
//     crypto.pbkdf2(
//         password,
//         salt,
//         310000,
//         32,
//         "sha256",
//         function (err, hashedPassword) {
//             if (err) throw err;
//         }
//     );
// });

module.exports = router;
