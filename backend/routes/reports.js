const express  = require("express");
const router   = express.Router();
const Booking  = require("../models/Booking");
const User     = require("../models/User");
const Equipment= require("../models/Equipment");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/reports/summary    (Admin Reports - totals overview)
router.get("/summary", protect, adminOnly, async (req, res) => {
    try {
        const totalBookings      = await Booking.countDocuments();
        const activeEquipment    = await Booking.countDocuments({ status: "active" });
        const maintenanceAlerts  = await Equipment.countDocuments({ status: "maintenance" });
        const uniqueUsers        = await Booking.distinct("user");
        res.json({
            totalBookings,
            activeEquipment,
            maintenanceAlerts,
            uniqueUsers: uniqueUsers.length
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/reports/top-equipment  (Admin Reports - most booked equipment)
router.get("/top-equipment", protect, adminOnly, async (req, res) => {
    try {
        const top = await Booking.aggregate([
            { $group: { _id: "$equipment", count: { $sum: 1 } } },
            { $sort:  { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "equipment", localField: "_id", foreignField: "_id", as: "equipment" } },
            { $unwind: "$equipment" },
            { $project: { name: "$equipment.name", category: "$equipment.category",
                          bookings: "$count", status: "$equipment.status" } }
        ]);
        res.json(top);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/reports/department-usage  (Admin Reports - bookings by department)
router.get("/department-usage", protect, adminOnly, async (req, res) => {
    try {
        const usage = await Booking.aggregate([
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $group: { _id: "$user.department", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(usage);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
