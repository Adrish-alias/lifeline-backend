const jwt = require("jsonwebtoken");

module.exports = function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      hospitalId: user.hospitalId?._id || null
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
