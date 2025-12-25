const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");

// @desc   Create a referral
// @route  POST /referrals
// @access Doctor
exports.createReferral = async (req, res) => {
  try {
    const { patientRef, resources, urgency, note } = req.body;

    if (!patientRef || !resources || !urgency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const referral = await Referral.create({
      patientRef,
      resources,
      urgency,
      note,
      createdBy: req.user._id,
      fromHospital: req.user.hospitalId // 🔥 CRITICAL
    });

    res.status(201).json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc   Doctor gets own referrals
exports.getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({
      createdBy: req.user._id,
      fromHospital: req.user.hospitalId // 🔥 scope
    }).sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc   Get referral by ID (Referral Staff)
// @access Referral Staff
exports.getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findOne({
      _id: req.params.id,
      fromHospital: req.user.hospitalId // 🔥 prevents cross-hospital access
    })
      .populate("createdBy", "name email")
      .populate("requestedHospital", "name");

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    res.json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc   Referral staff requests hospital
// @route  PATCH /referrals/:id/request
exports.requestHospital = async (req, res) => {
  try {
    const { hospitalId } = req.body;

    const referral = await Referral.findOne({
      _id: req.params.id,
      fromHospital: req.user.hospitalId
    });

    if (!referral) {
      return res.status(404).json({ message: "Referral not found" });
    }

    if (!["PENDING", "REJECTED"].includes(referral.status)) {
      return res.status(400).json({ message: "Referral cannot be requested now" });
    }

    // Prevent retrying same hospital
    if (
      referral.requestedHospital?.toString() === hospitalId ||
      referral.rejectedBy.includes(hospitalId)
    ) {
      return res.status(400).json({ message: "Hospital already tried" });
    }

    // If retrying, store previous rejection
    if (referral.status === "REJECTED" && referral.requestedHospital) {
      referral.rejectedBy.push(referral.requestedHospital);
    }

    referral.requestedHospital = hospitalId;
    referral.status = "REQUESTED";

    await referral.save();

    res.json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc   Referral staff queue (hospital-scoped)
// @route  GET /referrals
exports.getPendingReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({
      fromHospital: req.user.hospitalId // 🔥 THIS IS THE BIG ONE
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
