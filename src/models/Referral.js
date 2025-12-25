const mongoose = require("mongoose");
const referralSchema = new mongoose.Schema(
  {
    patientRef: {
      type: String,
      required: true
    },

    resources: {
      type: [String],
      required: true
    },

    urgency: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "REQUESTED", "ACCEPTED", "REJECTED"],
      default: "PENDING"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fromHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    },

    requestedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
    },

    rejectedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
      }
    ]
  },
  { timestamps: true }
);
module.exports = mongoose.model("Referral",referralSchema);