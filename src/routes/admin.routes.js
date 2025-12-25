const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  getIncomingRequests,
  acceptReferral,
  rejectReferral,
  getAcceptedRequests,
  getRejectedRequests
} = require("../controllers/admin.controller");



// All admin routes
router.use(protect);
router.use(authorize("admin"));

// Get incoming referral requests
router.get("/requests", getIncomingRequests);

// Accept referral
router.patch("/requests/:id/accept", acceptReferral);

// Reject referral
router.patch("/requests/:id/reject", rejectReferral);
// Accepted referrals
router.get("/requests/accepted", getAcceptedRequests);

// Rejected referrals
router.get("/requests/rejected", getRejectedRequests);

module.exports = router;
