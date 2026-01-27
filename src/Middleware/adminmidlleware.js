const adminOnly = function (req, res, next) {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).send({ status: false, message: "admin access only" });
  next();
};

module.exports = adminOnly;
