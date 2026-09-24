const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
// Person 2: Auth (Login, Register) + Users
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/users",         require("./routes/users"));

// Person 1 (Admin): Equipment, Students, Maintenance, Reports
app.use("/api/equipment",     require("./routes/equipment"));
app.use("/api/students",      require("./routes/students"));
app.use("/api/maintenance",   require("./routes/maintenance"));
app.use("/api/reports",       require("./routes/reports"));

// Person 3: Bookings, Bundles, Notifications, Profile
app.use("/api/bookings",      require("./routes/bookings"));
app.use("/api/bundles",       require("./routes/bundles"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "LabTrack API running", version: "1.0.0" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LabTrack server running on http://localhost:${PORT}`));
