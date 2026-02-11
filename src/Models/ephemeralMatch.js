const mongoose = require("mongoose");

const ephemeralMatchSchema = new mongoose.Schema(
  {
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],

    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // TTL delete
  },
  { timestamps: true }
);

ephemeralMatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EphemeralMatch", ephemeralMatchSchema);
