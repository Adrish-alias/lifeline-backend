const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createReferral,
  getMyReferrals,
  getPendingReferrals,
  getReferralById,
  requestHospital
} = require("../controllers/referral.controller");


const router = express.Router();
router.get(
  "/",
  protect,
  authorize("referral_staff"),
  getPendingReferrals
);

// TEST route (keep)
router.get(
  "/test",
  protect,
  authorize("doctor"),
  (req, res) => {
    res.json({ message: "Protected route accessed", user: req.user });
  }
);

//GET referrals
router.get(
  "/mine",
  protect,
  authorize("doctor"),
  getMyReferrals
);

router.get(
  "/:id",
  protect,
  authorize("referral_staff"),
  getReferralById
);

router.patch(
  "/:id/request",
  protect,
  authorize("referral_staff"),
  requestHospital
);


// CREATE referral (Doctor only)
router.post(
  "/",
  protect,
  authorize("doctor"),
  createReferral
);

module.exports = router;
