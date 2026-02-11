const jwt = require("jsonwebtoken");

const userAuth = function (req, res, next) {
  try {
    let token = req.headers["authorization"];
    if (!token) return res.status(401).send({ status: false, message: "token required" });

    if (token.startsWith("Bearer ")) token = token.slice(7);

    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role } or { adminId, role }
    next();
  } catch (err) {
    return res.status(401).send({ status: false, message: "invalid token" });
  }
};

module.exports = userAuth;
