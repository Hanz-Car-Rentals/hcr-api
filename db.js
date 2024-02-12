// require the needed modules
const mysql = require('mysql');

// require the config file where all the needed data is stored (db credentials, etc)
var config = require('./configs/config.json')

// create the connection with the specified credentials
var db = mysql.createConnection({
  host: config.db.host,
  user: config.db.username,
  password: config.db.password,
  database: config.db.name
});

// create users table if not existing
db.query('CREATE TABLE IF NOT EXISTS users ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    email TEXT UNIQUE NOT NULL, \
    email_verified BOOLEAN DEFAULT false, \
    email_verify_token TEXT, \
    first_name VARCHAR(255), \
    last_name VARCHAR(255), \
    password BLOB NOT NULL, \
    salt BLOB NOT NULL, \
    password_reset_token TEXT, \
    reset_password_token_expires_at DATETIME, \
    admin BOOLEAN DEFAULT 0, \
    times_rented INT DEFAULT 0, \
    currently_renting TEXT, \
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP \
)');


// Create the cars DB if not existing
db.query('CREATE TABLE IF NOT EXISTS cars ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    brand VARCHAR(255), \
    model VARCHAR(255), \
    year INT, \
    color VARCHAR(255), \
    price DECIMAL(10,2), \
    licence_plate VARCHAR(255), \
    rented_by int, \
    FOREIGN KEY (rented_by) REFERENCES users(id) \
)');

// Create the rentallog DB if not existing
db.query('CREATE TABLE IF NOT EXISTS rentallog ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    car_id INT, \
    user_id INT, \
    rent_date DATE, \
    return_date DATE, \
    FOREIGN KEY (car_id) REFERENCES cars(id), \
    FOREIGN KEY (user_id) REFERENCES users(id) \
)');

// Create the reviews DB if not existing
db.query('CREATE TABLE IF NOT EXISTS reviews ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    car_id INT, \
    user_id INT, \
    review TEXT, \
    rating INT, \
    FOREIGN KEY (car_id) REFERENCES cars(id), \
    FOREIGN KEY (user_id) REFERENCES users(id) \
)');

// db changes
// db.query('ALTER TABLE cars ADD COLUMN licence_plate VARCHAR(255)');

// makes the connection available for other files (e.g. routes)
module.exports = db;