const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    type: { 
      type: String, 
      enum: ["restaurant", "cafe", "bar", "club", "gym", "park", "library", "mall", "coworking", "event", "other"],
      default: "other"
    },
    description: { type: String, trim: true, default: "" },
    ownerName: { type: String, trim: true, default: "" },
    ownerEmail: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },

    addressLine1: { type: String, trim: true, default: "" },
    addressLine2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    zip: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "USA" },

    // Geolocation for venue-based matching
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    radiusMeters: { type: Number, default: 100, min: 10, max: 5000 },

    capacity: { type: Number, default: 0, min: 0 },
    pricePerHour: { type: Number, default: 0, min: 0 },
    currentOccupancy: { type: Number, default: 0, min: 0 },

    // Admin control
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // Optional metadata
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    operatingHours: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "23:00" }
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

venueSchema.index({ name: 1 });
venueSchema.index({ isActive: 1, isDeleted: 1 });
venueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Venue", venueSchema);
