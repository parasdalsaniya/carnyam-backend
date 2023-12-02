var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");

dotenv.config();

const verifyToken = function(req, res, next) {
  try {
    var token = req.headers.token;

    if (!token) throw { status: 401, message: "User is not authenticated!" };

    jwt.verify(token, process.env.JWT_SECRET, function(err, user) {
      if (err) throw { status: 403, message: "Token is not valid!" };
      // User.findById(user._id, function(err, userData) {
      //   if (err || !userData) throw { status: 403, message: "User not found!" };
      //   req.user = userData;
      //   next();
      // });
      next();
    });

  } catch (error) {
    res.status(error.status || 500).json({
      status: false,
      message: error.message || "Something went wrong"
    });
  }
};


module.exports = {
  verifyToken
}