// require the needed modules
const mysql = require('mysql');
var crypto = require('crypto');

// require the config file where all the needed data is stored (db credentials, etc)
var config = require('./configs/config.json')

// create the connection with the specified credentials
var db = mysql.createConnection({
	host: config.db.host,
	user: config.db.username,
	password: config.db.password,
	database: config.db.name
});


// create the salts table if it doesn't exist. The fields are: id INT AUTOINCREMENT PRIMARY KEY, salt INT NOT NULL
db.query(`CREATE TABLE IF NOT EXISTS salts (
	id INT AUTO_INCREMENT PRIMARY KEY,
	salt BLOB NOT NULL
)`, function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table salts created");
	}
});

// create the roles table if not exists. the fields are: id INT AUTOINCREMENT PRIMARY KEY, role TEXT NOT NULL, role_desc NOT NULL, role_level INT NOT NULL. The role_level is used to determine the level of the role, the lower the number the higher the level
db.query("CREATE TABLE IF NOT EXISTS roles ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	role_name TEXT NOT NULL, \
	role_desc TEXT NOT NULL, \
	role_level INT NOT NULL \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table roles created");
	}
});

// create the following roles in the roles table if the table is empty. These are the roles: Beheerder, Verhuurder, Gebruiker
db.query("SELECT * FROM roles", function (err, result) {
	if (err) throw err;
	// If the roles table is empty, create the default roles
	if (result.length === 0) {
		db.query("INSERT INTO roles (role_name, role_desc, role_level) VALUES (?, ?, ?)", ['Beheerder',			'De eigenaar van de website. Zorgt ervoor dat alles goed werkt en grijpt in als er problemen zijn.', 	4096]);
		db.query("INSERT INTO roles (role_name, role_desc, role_level) VALUES (?, ?, ?)", ['On-site Support', 	'Ze beheren de auto\'s op de locaties en zorgen ook dat nieuwe auto\'s op de website komen', 			2019]);
		db.query("INSERT INTO roles (role_name, role_desc, role_level) VALUES (?, ?, ?)", ['Verhuurder', 		'Medewerkers die beslissen of mensen een auto mogen huren of niet.',									67]);
		db.query("INSERT INTO roles (role_name, role_desc, role_level) VALUES (?, ?, ?)", ['Writer', 			'Creëren boeiende blogposts en optimaliseren auto beschrijvingen.', 									19]);
		db.query("INSERT INTO roles (role_name, role_desc, role_level) VALUES (?, ?, ?)", ['Gebruiker', 		'Mensen die een auto willen huren. Ze zoeken naar een auto, boeken er een en betalen online.', 			15]);
		db.query("INSERT INTO roles (role_name, role_desc, role_level) VALUES (?, ?, ?)", ['Gast Gebruiker',	'Mensen die hun e-mail nog niet hebben geverifieerd.', 3], function (err, result) {
			if (err) throw err;
			console.log("Default roles created");
		});
	}
});

// create the users table if it doesn't exist. The fiels are: id INT NOT NULL PRIMARY KEY AUTOINCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email TEXT NOT NULL, email_verified BOOLEAN, email_verify_token TEXT, token TEXT, password BLOB NOT NULL, salt INT NOT NULL, password_reset_token TEXT, password_reset_token_expires_at TIMESTAMP, role INT NOT NULL, verified_drivers_licence BOOLEAN, times_rented INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP. The salt is a foreign key to the salts table
db.query("CREATE TABLE IF NOT EXISTS users ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	first_name VARCHAR(255) NOT NULL, \
	last_name VARCHAR(255) NOT NULL, \
	email TEXT NOT NULL, \
	email_verified BOOLEAN, \
	email_verify_token TEXT, \
	token TEXT, \
	token_expires_at TIMESTAMP, \
	password BLOB NOT NULL, \
	salt INT NOT NULL, \
	password_reset_token TEXT, \
	password_reset_token_expires_at TIMESTAMP, \
	role INT NOT NULL DEFAULT 6, \
	verified_drivers_licence BOOLEAN, \
	times_rented INT, \
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
	FOREIGN KEY (salt) REFERENCES salts(id) \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table users created");
	}
});


// add a user to the table if the database is empty
db.query("SELECT * FROM users", function (err, result) {
	if (err) throw err;

	// If the users table is empty, create a default user
	if (result.length === 0) {
		// Generate a random salt
		const salt = crypto.randomBytes(16).toString('hex');
		// Hash the password using the salt
		const password = 'hcr.admin'; // Set your default password here
		crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
			if (err) throw err;
			// Insert the salt into the salts table
			db.query("INSERT INTO salts (salt) VALUES (?)", [salt], function (err, result) {
				if (err) throw err;

				// Get the ID of the inserted salt
				const saltId = result.insertId;

				// Insert the user into the users table with the salt ID
				db.query("INSERT INTO users (first_name, last_name, email, email_verified, password, salt, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
				['Hcr', 'Admin', 'hcr.admin@wolfsoft.solutions', 1, hashedPassword, saltId, 1],
				function (err, result) {
					if (err) throw err;
						console.log("Default user created");
					}
				);
			});
		});
	}
});

// Create a table called fuel_types where these are the fields: id INT, fuel_type TEXT NOT NULL
db.query("CREATE TABLE IF NOT EXISTS fuel_types ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	type TEXT NOT NULL \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table fuel_types created");
	}
});

// add some default fuel types to the table if the table is empty
db.query("SELECT * FROM fuel_types", function (err, result) {
	if (err) throw err;
	// If the fuel_types table is empty, create the default fuel types
	if (result.length === 0) {
		db.query("INSERT INTO fuel_types (type) VALUES (?) ", ['Benzine']);
		db.query("INSERT INTO fuel_types (type) VALUES (?) ", ['Diesel']);
		db.query("INSERT INTO fuel_types (type) VALUES (?) ", ['LPG']);
		db.query("INSERT INTO fuel_types (type) VALUES (?) ", ['Electric']);
		db.query("INSERT INTO fuel_types (type) VALUES (?) ", ['Hybrid'], function (err, result) {
			if (err) throw err;
			if(result.changedRows > 0){
				console.log("Default fuel types created");
			}
		});
	}
});

// Create a table called body_types where these are the fields: id INT, body_type TEXT NOT NULL
db.query("CREATE TABLE IF NOT EXISTS body_types ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	type TEXT NOT NULL \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table body_types created");
	}
});

// add some default body types to the table if the table is empty
db.query("SELECT * FROM body_types", function (err, result) {
	if (err) throw err;
	// If the body_types table is empty, create the default body types
	if (result.length === 0) {
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Station Wagon']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Sedan']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Convertible']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['SUV']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Minivan']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Pickup Truck']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Van']);
		db.query("INSERT INTO body_types (type) VALUES (?) ", ['Coupe'], function (err, result) {
		if (err) throw err;
			console.log("Default body types created");
		});
	}
});

// Create a table called car_types where these are the fields: id INT, brand TEXT NOT NULL, space INT NOT NULL, fuel INT NOT NULL, doors INT NOT NULL, towing_weight INT, maximum_gross_weight INT NOT NULL, build_year INT NOT NULL, body_type INT NOT NULL. Fuel is a foreign key to the fuel_types table, and body_type is a foreign key to the body_types table
db.query("CREATE TABLE IF NOT EXISTS car_types ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	brand TEXT NOT NULL, \
	model TEXT NOT NULL, \
	trunk_space INT NOT NULL, \
	fuel INT NOT NULL, \
	doors INT NOT NULL, \
	seats INT NOT NULL, \
	transmission TEXT NOT NULL, \
	towing_weight INT, \
	maximum_gross_weight INT NOT NULL, \
	build_year INT NOT NULL, \
	body_type INT NOT NULL, \
	FOREIGN KEY (fuel) REFERENCES fuel_types(id), \
	FOREIGN KEY (body_type) REFERENCES body_types(id) \
)", function (err, result) {
	if (err) throw err;
	// check if something has changed
	if(result.changedRows > 0){
		console.log("Table car_types created");
	}
});

// Create a table called locations where these are the fields: id INT, location TEXT NOT NULL
db.query("CREATE TABLE IF NOT EXISTS locations ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	location TEXT NOT NULL \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table locations created");
	}
});

// add some default locations to the table if the table is empty
db.query("SELECT * FROM locations", function (err, result) {
	if (err) throw err;
	// If the locations table is empty, create the default locations
	if (result.length === 0) {
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Saint Petersburg']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Amsterdam']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Rotterdam']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Utrecht']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Eindhoven']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Tilburg']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Groningen']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Almere']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Breda']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Nijmegen']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Apeldoorn']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Haarlem']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Arnhem']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Zaanstad']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Amersfoort']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Haarlemmermeer']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['s-Hertogenbosch']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Zoetermeer']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Zwolle']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Leiden']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Leeuwarden']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Maastricht']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Dordrecht']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Ede']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Alphen aan den Rijn']);
		db.query("INSERT INTO locations (location) VALUES (?) ", ['Den Haag'], function (err, result) {
		if (err) throw err;
			console.log("Default locations created");
		});
	}
});

// create the cars table if it doesn't exist the fields are: id INT, car_available BOOLEAN, picture_url TEXT, color VARCHAR, price_per_day DECIMAL, car_type INT, location INT, license_plate VARCHAR, created_at TIMESTAMP, updated_at TIMESTAMP. And the car_type is a foreign key to the car_types table and the location is a foreign key to the locations table
db.query("CREATE TABLE IF NOT EXISTS cars ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	car_available BOOLEAN, \
	picture_url TEXT NOT NULL, \
	color VARCHAR(255) NOT NULL, \
	price_per_day DECIMAL(10,2) NOT NULL, \
	car_type INT NOT NULL, \
	location INT NOT NULL, \
	license_plate VARCHAR(255) NOT NULL, \
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
	FOREIGN KEY (car_type) REFERENCES car_types(id), \
	FOREIGN KEY (location) REFERENCES locations(id) \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table cars created");
	}
});

// Create a table called rental_status where these are the fields: id INT, status TEXT NOT NULL
db.query("CREATE TABLE IF NOT EXISTS rental_status ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	status TEXT NOT NULL \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table rental_status created");
	}
});

// add some default rental statuses to the table if the table is empty
db.query("SELECT * FROM rental_status", function (err, result) {
	if (err) throw err;
	// If the rental_status table is empty, create the default rental statuses
	if (result.length === 0) {
		db.query("INSERT INTO rental_status (status) VALUES (?) ", ['Pending']);
		db.query("INSERT INTO rental_status (status) VALUES (?) ", ['Approved']);
		db.query("INSERT INTO rental_status (status) VALUES (?) ", ['Declined']);
		db.query("INSERT INTO rental_status (status) VALUES (?) ", ['Returned'], function (err, result) {
		if (err) throw err;
			console.log("Default rental statuses created");
		});
	}
});

// Create a table called reviews where these are the fields: id INT, user_id INT, car_id INT, review TEXT NOT NULL, rating INT NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP. The user_id is a foreign key to the users table and the car_id is a foreign key to the cars table
db.query("CREATE TABLE IF NOT EXISTS reviews ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	user_id INT NOT NULL, \
	car_id INT NOT NULL, \
	review TEXT NOT NULL, \
	rating INT NOT NULL, \
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
	FOREIGN KEY (user_id) REFERENCES users(id), \
	FOREIGN KEY (car_id) REFERENCES cars(id) \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table reviews created");
	}
});


// Create a table called rentallog where these are the fields: id INT, user_id INT, car_id INT, start_date TIMESTAMP, end_date TIMESTAMP, status INT NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP. The user_id is a foreign key to the users table and the car_id is a foreign key to the cars table and the status is a foreign key to the rental_status table
db.query("CREATE TABLE IF NOT EXISTS rentallog ( \
	id INT AUTO_INCREMENT PRIMARY KEY, \
	user_id INT NOT NULL, \
	car_id INT NOT NULL, \
	start_date TIMESTAMP NOT NULL, \
	end_date TIMESTAMP NULL DEFAULT NULL, \
	status INT NOT NULL, \
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \
	FOREIGN KEY (user_id) REFERENCES users(id), \
	FOREIGN KEY (car_id) REFERENCES cars(id), \
	FOREIGN KEY (status) REFERENCES rental_status(id) \
)", function (err, result) {
	if (err) throw err;
	if(result.changedRows > 0){
		console.log("Table rentallog created");
	}
});



// export the db connection
module.exports = db;