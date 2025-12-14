const Hospital = require("../models/Hospital");

// @desc   Search hospitals by available resources
// @route  GET /hospitals/search
// @access Referral Staff
exports.searchHospitals = async (req, res) => {
  try {
    const resources = req.query.resources?.split(",");

    if (!resources || resources.length === 0) {
      return res.status(400).json({ message: "Resources are required" });
    }

    // Build dynamic query:
    // capacities.ICU > 0, capacities.VENTILATOR > 0, etc.
    const capacityQuery = {};
    resources.forEach(resource => {
      capacityQuery[`capacities.${resource}`] = { $gt: 0 };
    });

    const hospitals = await Hospital.find(capacityQuery);

    res.json(hospitals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
