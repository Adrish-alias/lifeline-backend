const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");
// --------------------------------------------------
// @desc    Get incoming referral requests for hospital admin
// @route   GET /admin/requests
// @access  Admin
// --------------------------------------------------
exports.getIncomingRequests = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const referrals = await Referral.find({
      status: "REQUESTED",
      requestedHospital: hospitalId
    })
      .populate("createdBy", "name email")
      .populate("fromHospital", "name")
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// @desc    Accept referral
// @route   PATCH /admin/referrals/:id/accept
// @access  Admin
// --------------------------------------------------
exports.acceptReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Ensure correct state
    if (referral.status !== "REQUESTED") {
      return res.status(400).json({ message: "Referral not in request state" });
    }

    // Ensure hospital is the one requested
    if (referral.requestedHospital.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: "Not authorized for this referral" });
    }

    const hospital = await Hospital.findById(req.user.hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // ✅ Check resource availability
    for (const resource of referral.resources) {
      if (!hospital.capacities[resource] || hospital.capacities[resource] <= 0) {
        return res.status(400).json({
          message: `Insufficient ${resource} capacity`
        });
      }
    }

    // ✅ Deduct resources
    referral.resources.forEach(resource => {
      hospital.capacities[resource] -= 1;
    });

    // ✅ Update referral state
    referral.status = "ACCEPTED";
    referral.acceptedBy = hospital._id;

    await hospital.save();
    await referral.save();

    res.json({
      message: "Referral accepted successfully",
      referral
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// --------------------------------------------------
// @desc    Reject referral
// @route   PATCH /admin/referrals/:id/reject
// @access  Admin
// --------------------------------------------------
exports.rejectReferral = async (req, res) => {
  try {
    const referral = await Referral.findOne({
      _id: req.params.id,
      requestedHospital: req.user.hospitalId,
      status: "REQUESTED"
    });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Push to rejected list
    referral.rejectedBy.push(req.user.hospitalId);

    // Clear current request
    referral.requestedHospital = null;
    referral.status = "REJECTED";

    await referral.save();

    res.json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc   Get referrals accepted by this hospital
// @route  GET /admin/requests/accepted
// @access Admin
exports.getAcceptedRequests = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const referrals = await Referral.find({
      acceptedBy: hospitalId
    })
      .populate("createdBy", "name email")
      .populate("fromHospital", "name")
      .sort({ updatedAt: -1 });

    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc   Get referrals rejected by this hospital
// @route  GET /admin/requests/rejected
// @access Admin
exports.getRejectedRequests = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const referrals = await Referral.find({
      rejectedBy: hospitalId
    })
      .populate("createdBy", "name email")
      .populate("fromHospital", "name")
      .sort({ updatedAt: -1 });

    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
