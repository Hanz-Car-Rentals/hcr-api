let db = require("../db");
let permissions = require("../configs/permissions.json");
let { query } = require("./database_queries");

async function check_user_token(req, res, next){
	var webToken = req.headers['authorization'];
	if(webToken){
		if(webToken.startsWith("Bearer ")){
			webToken = webToken.split(" ")[1];
		} else {
			webToken = undefined;
		}
	}

	if (webToken === undefined){
		res.status(401).send({"status": 401, "message": "Invalid token"});
	}
	else{
		db.query("SELECT * FROM users WHERE token = ?", [webToken], function(err, result){
			if (err) throw err;
			if (result.length > 0){
                if(result[0].token_expires_at > new Date()){
                    res.status(401).send({"status": 401, "message": "Token expired"});
                } else {
                    next();
                }
			}
			else{
				res.status(401).send({"status": 401, "message": "Invalid token"});
			}
		});
	}
};

async function getUserRoleFromDatabase(authToken) {
    return new Promise((resolve, reject) => {
        db.query('SELECT role FROM users WHERE token = ?', [authToken], (err, results) => {
            if (err) {
                console.error('Error fetching user role from database:', err);
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(null);
			}

			resolve(results[0].role);
        });
    });
}

async function getUserPermissionsFromDatabase(roleId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT role_level FROM roles WHERE id = ?', [roleId], (err, results) => {
            if (err) {
                console.error('Error fetching user permissions from database:', err);
                return reject(err);
            }
            if (results.length === 0) {
                return resolve(0); // Assuming default permissions are 0
            }
            resolve(results[0].role_level);
        });
    });
}

function hasPermission(permission, userPermissions, given_id, user_id) {
    // if the user has the ADMIN permission then they can access everything
    if (userPermissions & permissions['ADMIN']) {
        return true;
    } else if(given_id && user_id && given_id == user_id) {
        return true;
    } else {
        return (userPermissions & permission) === permission;
    }
}

function checkPermission(permission) {
    return async function(req, res, next) {
        try {
            let authToken = req.headers["authorization"];
			if(authToken && !authToken.startsWith("Bearer ")) {
				return res.status(403).send({
					"status": 403,
					"message": "Invalid token"
				});
			}
            if (!authToken) {
                return res.status(401).json({ error: 'Unauthorized: Missing authorization token' });
            }
			authToken = authToken.split(" ")[1];

            const userRole = await getUserRoleFromDatabase(authToken);
            if (!userRole) {
                return res.status(403).json({ error: 'Forbidden: Invalid authorization token' });
            }

            const userPermissions = await getUserPermissionsFromDatabase(userRole);
            if (!hasPermission(permissions[permission], userPermissions)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            // If user has the required permission, proceed to the next middleware/route handler
            next();
        } catch (error) {
            console.error('Error checking user permission:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}

// if the user has permission or if the user is viewing their own page
function user_check(permission){
    return async function(req, res, next){
        let token = req.headers["Authorization"].split(" ")[1];
        let user = await query("SELECT * FROM users WHERE token =?", [token])
        if(hasPermission(permission, req.headers["authorization"], req.params.id, user[0].id)){
            next();
        } else {
            res.status(403).json({error: 'Forbidden: Insufficient permissions'});
        }
    }
}

module.exports = {
	check_user_token,
	checkPermission,
	user_check
};