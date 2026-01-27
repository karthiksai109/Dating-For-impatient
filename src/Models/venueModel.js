const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    address: {
        type: String, 
        default: "" 
    },
    city: { 
        type: String, 
        default: "" 
    },
    state: { 
        type: String, 
        default: "" 
    },
    lat: { 
        type: Number, 
        default: null
    },
    lng: { 
        type: Number, 
        default: null 
    },
    radiusMeters: { 
        type: Number, 
        default: 150 
    },

    isActive: { 
        type: Boolean, 
        default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", venueSchema);