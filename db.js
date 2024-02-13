// require the needed modules
var mysql = require('mysql');

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
    username VARCHAR(255), \
    password VARCHAR(255), \
    admin BOLEAN() NOT NULL, \
    times_rented INT DEFAULT 0, \
    currently_renting TEXT, \
    email VARCHAR(255) \
)');

// Create the cars DB if not existing
db.query('CREATE TABLE IF NOT EXISTS cars ( \
    id INT AUTO_INCREMENT PRIMARY KEY, \
    brand VARCHAR(255), \
    model VARCHAR(255), \
    year INT, \
    color VARCHAR(255), \
    price DECIMAL, \
    rented_by TEXT, \
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

// makes the connection available for other files (e.g. routes)
module.exports = db;