const mongoose = require("mongoose");
const matchSchema = new mongoose.Schema(
  {
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true
    },

    howMatched: {
      type: String,
      enum: ["swipe", "nearby", "event", "admin"],
      default: "nearby"
    },

    matchedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Prevent duplicate matches (A-B same as B-A)
matchSchema.index({ users: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);
