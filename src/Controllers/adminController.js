const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../Models/adminModel");
const User = require("../Models/userRegisterModel");
const Venue = require("../Models/venueModel");
const Report = require("../Models/reportModel");

//ADMIN REGISTER (protected by secret key) 
const adminRegister = async function (req, res) {
  try {
    let data = req.body;
    if (!data) return res.status(400).send({ status: false, message: "please enter all fields..." });

    let { name, email, password, secretKey } = data;

    if (!secretKey) return res.status(400).send({ status: false, message: "secretKey is required" });
    if (secretKey !== process.env.ADMIN_REGISTER_SECRET)
      return res.status(401).send({ status: false, message: "invalid secretKey" });

    if (!name) return res.status(400).send({ status: false, message: "name is required" });
    if (!email) return res.status(400).send({ status: false, message: "email is required" });
    if (!password) return res.status(400).send({ status: false, message: "password is required" });

    let exists = await Admin.findOne({ email });
    if (exists) return res.status(400).send({ status: false, message: "email already exists" });

    let hashed = await bcrypt.hash(password, 10);

    let admin = await Admin.create({ name, email, password: hashed });

    return res.status(201).send({
      status: true,
      message: "admin registered",
      data: { _id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ADMIN LOGIN 
const adminLogin = async function (req, res) {
  try {
    let data = req.body;
    if (!data) return res.status(400).send({ status: false, message: "please enter all fields..." });

    let { email, password } = data;
    if (!email) return res.status(400).send({ status: false, message: "email is required" });
    if (!password) return res.status(400).send({ status: false, message: "password is required" });

    let admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).send({ status: false, message: "invalid credentials" });

    let ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).send({ status: false, message: "invalid credentials" });

    let token = jwt.sign(
      { adminId: admin._id.toString(), role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).send({
      status: true,
      message: "login success",
      data: { token, admin: { _id: admin._id, name: admin.name, email: admin.email } }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ ADMIN ME */
const adminMe = async function (req, res) {
  try {
    let admin = await Admin.findById(req.user.adminId).select("_id name email createdAt");
    if (!admin) return res.status(404).send({ status: false, message: "admin not found" });

    return res.status(200).send({ status: true, message: "admin", data: admin });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/** ✅ DASHBOARD STATS (users + venues + reports + match placeholders) */
const getDashboardStats = async function (req, res) {
  try {
    // users
    let totalUsers = await User.countDocuments();
    let activeUsers = await User.countDocuments({ status: "Active" });
    let suspendedUsers = await User.countDocuments({ status: "Suspended" });
    let bannedUsers = await User.countDocuments({ status: "Banned" });

    // venues
    let totalVenues = await Venue.countDocuments();
    let activeVenues = await Venue.countDocuments({ isActive: true });

    // reports
    let openReports = await Report.countDocuments({ status: "Open" });

    // matches (depends on your schema - add later)
    // let totalMatches = await Match.countDocuments();

    return res.status(200).send({
      status: true,
      message: "dashboard stats",
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        bannedUsers,
        totalVenues,
        activeVenues,
        openReports
        // totalMatches
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


module.exports = { adminRegister, adminLogin, adminMe, getDashboardStats};


