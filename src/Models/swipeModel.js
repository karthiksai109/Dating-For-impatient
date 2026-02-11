const mongoose = require("mongoose");

const swipeSchema = new mongoose.Schema(
  {
    swiperId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    swipedId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    direction: { type: String, enum: ["left", "right"], required: true },
  },
  { timestamps: true }
);

swipeSchema.index({ swiperId: 1, swipedId: 1, venueId: 1 }, { unique: true });

module.exports = mongoose.model("Swipe", swipeSchema);
