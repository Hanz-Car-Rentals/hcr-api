let db = require("../db");

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
        next();
      }
      else{
        res.status(401).send({"status": 401, "message": "Invalid token"});
      }
    });
  }
};

async function admin_check(req, res, next){
  var webToken = req.headers['authorization'];
  if(webToken.startsWith("Bearer ")){
    webToken = webToken.split(" ")[1];
  } else {
    webToken = undefined;
  }

  if (webToken === undefined){
    res.send({"status": 401, "message": "UNAUTHORIZED"});
  }
  else{
    db.query("SELECT * FROM users WHERE token = ?", [webToken], function(err, result){
      if (err) throw err;
      if (result.length > 0){
        if (result[0].admin === 1){
          next();
        }
        else{
          res.status(401).send({"status": 401, "message": "Unauthorized access"});
        }
      }
      else{
        res.status(401).send({"status": 401, "message": "Invalid token"});
      }
    });
  }
};

async function user_check(req, res, next) {
  var webToken = req.headers['authorization'];
  var userId = req.params.id;
  if(webToken.startsWith("Bearer ")){
    webToken = webToken.split(" ")[1];
  } else {
    webToken = undefined;
  }

  if (webToken === undefined){
    res.send({"status": 401, "message": "UNAUTHORIZED"});
  }
  else{
    db.query("SELECT * FROM users WHERE token = ?", [webToken], function(err, result){
      if (err) throw err;
      if (result.length > 0){
        userId = parseInt(userId);
        if (result[0].id === userId){
          next();
        } else if(result[0].admin === 1){
          next();
        } else {
          res.status(401).send({"status": 401, "message": "Unauthorized access"});
        }
      }
      else{
        res.status(401).send({"status": 401, "message": "Invalid token"});
      }
    });
  }
}

module.exports = {
  check_user_token,
  admin_check,
  user_check
};