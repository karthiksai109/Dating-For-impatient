const express = require("express");
const router = express.Router();

const auth = require("../Middleware/auth");
const userAuth = require("../Middleware/userAuth");
const adminOnly = require("../Middleware/adminmidlleware");

const {
  getAllUsers, getUserById, updateUser, deleteUser
} = require("../Controllers/userController");

const {
  adminRegister, adminLogin, adminMe, getDashboardStats
} = require("../Controllers/adminController");

const {
  userRegister, userLogin, getMyProfile, updateMyProfile
} = require("../Controllers/authController");

const {
  getVenueProfiles, swipeRight, swipeLeft, getMyMatches, getAllMyMatches, blockUser, unblockUser
} = require("../Controllers/matchController");

const {
  sendMessage, getMessages, getMyChatList
} = require("../Controllers/messageController");

const {
  checkIn, checkOut, heartbeat, getNearbyVenues, getVenuePeopleCount, autoDetectVenue
} = require("../Controllers/checkinController");

const {
  createReport, getAllReports, updateReport
} = require("../Controllers/reportController");

const v = require("../Controllers/venueController");

// ==================== USER AUTH ====================
router.post("/userregister", userRegister);
router.post("/userlogin", userLogin);
router.get("/me", userAuth, getMyProfile);
router.patch("/me", userAuth, updateMyProfile);

// ==================== ADMIN AUTH ====================
router.post("/adminregister", adminRegister);
router.post("/adminlogin", adminLogin);
router.get("/adminme", auth, adminOnly, adminMe);
router.get("/dashboard", auth, adminOnly, getDashboardStats);

// ==================== ADMIN USER MANAGEMENT ====================
router.get("/admin/users", auth, adminOnly, getAllUsers);
router.get("/admin/users/:userId", auth, adminOnly, getUserById);
router.patch("/admin/users/:userId", auth, adminOnly, updateUser);
router.delete("/admin/users/:userId", auth, adminOnly, deleteUser);

// ==================== ADMIN VENUE MANAGEMENT ====================
router.get("/venues/stats", auth, adminOnly, v.getVenueStats);
router.post("/venues", auth, adminOnly, v.createVenue);
router.get("/venues/admin", auth, adminOnly, v.getVenues);
router.get("/venues/admin/:id", auth, adminOnly, v.getVenueById);
router.patch("/venues/:id", auth, adminOnly, v.updateVenue);
router.patch("/venues/:id/toggle", auth, adminOnly, v.toggleVenue);
router.delete("/venues/:id", auth, adminOnly, v.deleteVenue);

// ==================== USER VENUE CHECK-IN ====================
router.get("/venues/nearby", userAuth, getNearbyVenues);
router.post("/venues/checkin", userAuth, checkIn);
router.post("/venues/checkout", userAuth, checkOut);
router.post("/venues/heartbeat", userAuth, heartbeat);
router.get("/venues/:venueId/people", userAuth, getVenuePeopleCount);
router.post("/venues/detect", userAuth, autoDetectVenue);

// ==================== MATCHING & SWIPING ====================
router.get("/discover", userAuth, getVenueProfiles);
router.post("/swipe/right", userAuth, swipeRight);
router.post("/swipe/left", userAuth, swipeLeft);
router.get("/matches", userAuth, getMyMatches);
router.get("/matches/all", userAuth, getAllMyMatches);

// ==================== MESSAGING (VENUE-LOCKED) ====================
router.get("/chats", userAuth, getMyChatList);
router.post("/messages", userAuth, sendMessage);
router.get("/messages/:matchId", userAuth, getMessages);

// ==================== BLOCK & REPORT ====================
router.post("/block", userAuth, blockUser);
router.post("/unblock", userAuth, unblockUser);
router.post("/report", userAuth, createReport);

// ==================== ADMIN REPORTS ====================
router.get("/admin/reports", auth, adminOnly, getAllReports);
router.patch("/admin/reports/:reportId", auth, adminOnly, updateReport);

module.exports = router;
