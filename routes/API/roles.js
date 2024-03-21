// require the needed modules
var express = require("express");
var db = require("../../db");
var { send_error } = require("../../functions/error");
var {
  check_user_token,
  user_check,
  check_permission,
  hasPermission
} = require("../../functions/middleware");
var permissions_json = require("../../configs/permissions.json");
var { query } = require("../../functions/database_queries");

// create the router
var router = express.Router();

// the route for getting all the roles
router.get("/", check_user_token, check_permission("GET_ROLES"), function(req, res, next){
	db.query("SELECT * FROM roles", function(err, results){
		if (err){
			send_error(err, "Error getting roles");
			res.status(500).send({status: 500, message: "Error getting roles"});
		} else {
			res.send({status: 200, message: "Roles", data: results});
		}
	});
});

// the route for getting a role by id
router.get("/:id", check_user_token, check_permission("GET_ROLES"), function(req, res, next){
	let id = req.params.id;
	db.query("SELECT * FROM roles WHERE id = ?", [id], function(err, results){
		if (err){
			send_error(err, "Error getting role");
			res.status(500).send({status: 500, message: "Error getting role"});
		} else {
			if(results.length === 0){
				res.status(404).send({status: 404, message: "Role not found"});
			}
			res.send({status: 200, message: "Role", data: results});
		}
	});
});

// route to create a new role.
router.post("/add", check_user_token, check_permission("CREATE_ROLES"), async function(req, res, next){
	let role = req.body.role_name;
	let permissions = req.body.permissions;
	let role_desc = req.body.role_desc;
	// check if the permissions can be split into an array or if it's one item
	if(Array.isArray(permissions)){
		permissions = permissions.split(",");
	} else if(!Array.isArray(permissions)){
		permissions = [permissions];
	} else {
		return res.status(500).send({status: 500, message: "Something went wrong."});
	}
	console.log(permissions);
	let token = req.headers["authorization"].split(" ")[1];

	// get the users permissions
	let user_by_user_token = await query("SELECT * FROM users WHERE token = ?", [token]);
	let user_role = user_by_user_token[0].role;

	// get the roles permissions
	let role_permissions = await query("SELECT role_level FROM roles WHERE id = ?", [`${await user_role}`]);

	// for each permission
	permissions.forEach(permission => {
		// check if the permission is allowed to be given from the user
		// check if the user has the ADMIN permission.
		if(!permissions_json[permission]){
			return res.status(400).send({status: 400, message: "Invalid permission"});
		}
		if(hasPermission(permissions_json["ADMIN"], role_permissions[0].role_level)){
			console.log("Permission is allowed: " + permission);
		} else if(!hasPermission(permissions_json[permission], role_permissions[0].role_level)){
			console.log("Permission is not allowed: " + permissions_json[permission]);
			return res.status(403).send({status: 403, message: "Forbidden: Insufficient permissions"});
		} else if(hasPermission(permissions_json[permission], role_permissions[0].role_level)){
			console.log("Permission is allowed: " + permission);
		}
	});

	let role_level = 0;

	permissions.forEach(permission => {
		role_level += permissions_json[permission];
	})

	console.log(role_level);
	
	db.query("INSERT INTO roles (role_name, role_level, role_desc) VALUES (?, ?, ?)", [role, role_level, role_desc], function(err, results){
		if (err){
			send_error(err, "Error creating role");
			return res.status(500).send({status: 500, message: "Error creating role"});
		} else {
			return res.send({status: 200, message: "Role created"});
		}
	});
});

module.exports = router;
