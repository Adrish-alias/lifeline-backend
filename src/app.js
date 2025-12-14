const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const referralRoutes = require("./routes/referral.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
//referral routes
app.use("/referrals", referralRoutes);
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});
//hospital routes
app.use("/hospitals", hospitalRoutes); // ✅ NEW



module.exports = app;
