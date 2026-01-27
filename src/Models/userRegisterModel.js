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
    }, // optional; you can compute from DOB

    hobbies: { 
        type: [String], 
        required:true
    },

    bio: { 
        type: String,
         maxlength: 500, 
         required:true
        },

    

    // 6 photos
    photos: {
      type: [String],
      default: [],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
