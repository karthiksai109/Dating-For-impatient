const mongoose = require("mongoose");

const venuePresenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },

    // last time user pinged location from client
    lastSeenAt: { type: Date, default: Date.now },

    // auto-clean: if they stop pinging, presence expires
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: Mongo will delete docs after expiresAt
venuePresenceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("VenuePresence", venuePresenceSchema);
