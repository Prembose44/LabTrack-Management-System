const express   = require("express");
const router    = express.Router();
const Booking   = require("../models/Booking");
const Equipment = require("../models/Equipment");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/bookings           (Student - get my bookings)
router.get("/", protect, async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.status) filter.status = req.query.status;
        const bookings = await Booking.find(filter)
            .populate("equipment", "name category image equipmentId");
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings/all       (Admin - get all bookings)
router.get("/all", protect, adminOnly, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const bookings = await Booking.find(filter)
            .populate("user",      "name email studentId")
            .populate("equipment", "name category equipmentId");
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bookings          (Student - Book an equipment)
router.post("/", protect, async (req, res) => {
    try {
        const { equipmentId, returnBy, notes } = req.body;
        const equip = await Equipment.findById(equipmentId);
        if (!equip || equip.available < 1)
            return res.status(400).json({ message: "Equipment not available" });

        const booking = await Booking.create({
            user: req.user.id, equipment: equipmentId, returnBy, notes
        });
        // Decrement available count
        await Equipment.findByIdAndUpdate(equipmentId, { $inc: { available: -1 } });
        res.status(201).json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/return  (Student - Return an equipment)
router.put("/:id/return", protect, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status: "completed", returnedOn: new Date() }, { new: true });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        await Equipment.findByIdAndUpdate(booking.equipment, { $inc: { available: 1 } });
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/extend  (Student - Extend a booking)
router.put("/:id/extend", protect, async (req, res) => {
    try {
        const { days } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        const newReturn = new Date(booking.returnBy);
        newReturn.setDate(newReturn.getDate() + days);
        booking.extended   = true;
        booking.extendDays = days;
        booking.newReturnBy= newReturn;
        await booking.save();
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/cancel  (Student - Cancel a pending booking)
router.put("/:id/cancel", protect, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id, status: "pending" },
            { status: "cancelled" }, { new: true });
        if (!booking) return res.status(404).json({ message: "Booking not found or not cancellable" });
        await Equipment.findByIdAndUpdate(booking.equipment, { $inc: { available: 1 } });
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/approve  (Admin - Approve pending booking)
router.put("/:id/approve", protect, adminOnly, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id, { status: "active", approvedBy: req.user.name }, { new: true });
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
