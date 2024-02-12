let config = require("../configs/config.json");
let token = config.api_token;
function check_token(req, res, next) {
  // get the token from the headers
  var x = req.headers['authorization'];
  if (x === `Bearer ${token}`){
    next();
  }
  else{
    res.send({"status": 401, "message": "UNAUTHORIZED"});
  }
}

module.exports = {
    check_token
};