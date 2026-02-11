// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },

    email: { 
        type: String, 
        required: true,
        unique: true, 
        lowercase: true, 
        trim: true 
    },

    phone: {
        type: String,
        default: ""
    },

    password: { 
        type: String, 
        required: true 
    },

    dateOfBirth: { 
        type: Date, 
        required: true 
    },

    age: { 
        type: Number, 
        default: null 
    },

    gender: {
        type: String,
        enum: ["male", "female", "non-binary", "other", ""],
        default: ""
    },

    interestedIn: {
        type: String,
        enum: ["male", "female", "everyone", ""],
        default: "everyone"
    },

    hobbies: { 
        type: [String], 
        required: true
    },

    interests: {
        type: [String],
        default: []
    },

    bio: { 
        type: String,
        maxlength: 500, 
        required: true
    },

    // 6 photos
    photos: {
      type: [String],
      default: [],
    },

    // Privacy: these are NEVER exposed to other users
    privacySettings: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showAge: { type: Boolean, default: true },
      showBio: { type: Boolean, default: true },
    },

    // Real-time state only (PRD: don't store historical location)
    isregistered: { 
        type: Boolean, 
        default: false 
    },
    activeVenueId: { 
        type: mongoose.Types.ObjectId,
        ref: "Venue", 
        default: null 
    },
    lastActiveAt: { 
        type: Date, 
        default: Date.now 
    },
    status: {
        type: String, 
        enum: ["Active", "Suspended", "Banned"], 
        default: "Active" 
    },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user"
    },

    // Swipe tracking
    swipedRight: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    swipedLeft: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Block list
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.index({ activeVenueId: 1, status: 1 });
userSchema.index({ hobbies: 1 });
userSchema.index({ interests: 1 });

module.exports = mongoose.model("User", userSchema);
