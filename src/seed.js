require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Hospital = require("./models/Hospital");
const Referral = require("./models/Referral");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 🔥 Clear old data
    await User.deleteMany();
    await Hospital.deleteMany();
    await Referral.deleteMany();

    // 🏥 Create hospitals
    const hospitalA = await Hospital.create({
      name: "City Hospital",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716]
      },
      capacities: {
        ICU: 5,
        VENTILATOR: 3,
        OXYGEN: 10
      }
    });

    const hospitalB = await Hospital.create({
      name: "Metro Hospital",
      location: {
        type: "Point",
        coordinates: [77.6100, 12.9350]
      },
      capacities: {
        ICU: 2,
        VENTILATOR: 1,
        OXYGEN: 5
      }
    });

    // 👨‍⚕️ Doctor (Hospital A)
    await User.create({
      name: "Dr Strange",
      email: "doctor@test.com",
      password: "password123",
      role: "doctor",
      hospitalId: hospitalA._id
    });

    // 🧑‍💼 Referral Staff (Hospital A)
    await User.create({
      name: "Referral Desk A",
      email: "referral@test.com",
      password: "password123",
      role: "referral_staff",
      hospitalId: hospitalA._id
    });

    // 🏥 Hospital Admin (Hospital B)
    await User.create({
      name: "Admin Metro",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      hospitalId: hospitalB._id
    });

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
