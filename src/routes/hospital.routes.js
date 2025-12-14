const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { searchHospitals } = require("../controllers/hospital.controller");

const router = express.Router();

// Search hospitals by resources
router.get(
  "/search",
  protect,
  authorize("referral_staff"),
  searchHospitals
);

module.exports = router;
