const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const adminOnly = require("../Middleware/adminmidlleware");
const {userRegister,getAllUsers,getUserById}=require('../Controllers/userController')
const { adminRegister, adminLogin, adminMe,getDashboardStats} = require("../Controllers/adminController");


router.post("/userregister", userRegister);
router.post("/adminregister", adminRegister);
router.post("/adminlogin", adminLogin);

router.get("/adminme", auth, adminOnly, adminMe);
router.get("/dashboard", auth, adminOnly, getDashboardStats);
router.get("/admin/users", auth, adminOnly, getAllUsers);
router.get("/admin/users/:userId", auth, adminOnly, getUserById);

module.exports = router;

