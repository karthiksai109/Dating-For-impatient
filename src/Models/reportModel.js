const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterUserId: {
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    reportedUserId: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    reason: { 
        type: String, 
        required: true, 
        trim: true 
    },
    details: { 
        type: String,
         default: "" 
        },
    status: { 
        type: String, 
        enum: ["Open", "Reviewed", "Closed"], 
        default: "Open" 
    },
    adminNotes: { 
        type: String, 
        default: "" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
