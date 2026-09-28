const express   = require("express");
const router    = express.Router();
const Booking   = require("../models/Booking");
const Equipment = require("../models/Equipment");
const { protect, adminOnly } = require("../middleware/auth");

/* ── helpers ──────────────────────────────────────────────────────────── */

/** Returns the Sunday 00:00:00 of the current week */
function getWeekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * After a booking slot is freed (return or cancel), check if anyone is
 * waitlisted for that equipment and auto-promote the first person.
 */
async function promoteWaitlisted(equipmentId) {
    const next = await Booking.findOne({ equipment: equipmentId, status: "waitlisted" })
                              .sort({ waitlistPosition: 1 });
    if (!next) return;

    // Promote to pending
    next.status           = "pending";
    next.waitlistPosition = null;
    await next.save();

    // Renumber everyone behind them
    await Booking.updateMany(
        { equipment: equipmentId, status: "waitlisted" },
        { $inc: { waitlistPosition: -1 } }
    );

    // Fire an in-app notification for the promoted student
    try {
        const Notification = require("../models/Notification");
        const equip = await Equipment.findById(equipmentId).select("name");
        await Notification.create({
            user:      next.user,
            title:     "Waitlist Slot Available!",
            message:   `A slot for ${equip ? equip.name : "the equipment"} has freed up. Your booking is now pending approval.`,
            type:      "booking_approved",
            icon:      "🔔",
            iconBg:    "#d1fae5",
            iconColor: "#059669",
            link:      "my-bookings.html"
        });
    } catch (_) { /* non-critical — booking promotion still succeeds */ }
}

/* ── QUOTA routes (must come BEFORE /:id routes) ─────────────────────── */

// GET /api/bookings/quota  — current student's weekly quota
router.get("/quota", protect, async (req, res) => {
    try {
        const User      = require("../models/User");
        const user      = await User.findById(req.user.id);
        const weekStart = getWeekStart(new Date());

        // Auto-reset counter when a new week begins
        if (!user.quotaWeekStart || new Date(user.quotaWeekStart) < weekStart) {
            user.weeklyQuotaUsed = 0;
            user.quotaWeekStart  = weekStart;
            await user.save();
        }

        const limit = 4 + (user.quotaBoost || 0);
        res.json({
            used:      user.weeklyQuotaUsed,
            limit,
            remaining: Math.max(0, limit - user.weeklyQuotaUsed)
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/quota-boost/:userId  — admin grants extra quota
router.put("/quota-boost/:userId", protect, adminOnly, async (req, res) => {
    try {
        const User  = require("../models/User");
        const boost = parseInt(req.body.boost) || 2;
        const user  = await User.findByIdAndUpdate(
            req.params.userId,
            { quotaBoost: boost },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: `Quota boost of +${boost} granted to ${user.name}`, boost });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bookings/waitlist/:equipmentId  — join waitlist
router.post("/waitlist/:equipmentId", protect, async (req, res) => {
    try {
        const { equipmentId } = req.params;

        // Prevent duplicate waitlist entry for same student+equipment
        const exists = await Booking.findOne({
            user: req.user.id, equipment: equipmentId, status: "waitlisted"
        });
        if (exists) {
            return res.status(400).json({
                message:  "Already on waitlist",
                position: exists.waitlistPosition
            });
        }

        const count    = await Booking.countDocuments({ equipment: equipmentId, status: "waitlisted" });
        const returnBy = new Date();
        returnBy.setDate(returnBy.getDate() + 7);

        const booking = await Booking.create({
            user:             req.user.id,
            equipment:        equipmentId,
            returnBy,
            status:           "waitlisted",
            waitlistPosition: count + 1
        });
        res.status(201).json({ message: "Added to waitlist", position: count + 1, booking });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/checkin  — student checks in on active booking
router.put("/:id/checkin", protect, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id, status: "active" },
            { checkedIn: true, checkInTime: new Date() },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Active booking not found" });
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── STANDARD BOOKING routes ─────────────────────────────────────────── */

// GET /api/bookings           (Student — my bookings)
router.get("/", protect, async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.status) filter.status = req.query.status;
        const bookings = await Booking.find(filter)
            .populate("equipment", "name category image equipmentId");
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings/all       (Admin — all bookings)
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

// POST /api/bookings          (Student — book equipment)
router.post("/", protect, async (req, res) => {
    try {
        const { equipmentId, returnBy, notes } = req.body;

        // ── Quota gate ────────────────────────────────────────
        const User      = require("../models/User");
        const user      = await User.findById(req.user.id);
        const weekStart = getWeekStart(new Date());

        if (!user.quotaWeekStart || new Date(user.quotaWeekStart) < weekStart) {
            user.weeklyQuotaUsed = 0;
            user.quotaWeekStart  = weekStart;
            await user.save();
        }

        const limit = 4 + (user.quotaBoost || 0);
        if (user.weeklyQuotaUsed >= limit) {
            return res.status(429).json({
                message:  `Weekly booking limit reached (${limit}/week). Resets next Monday.`,
                used:     user.weeklyQuotaUsed,
                limit
            });
        }
        // ── End quota gate ────────────────────────────────────

        const equip = await Equipment.findById(equipmentId);
        if (!equip || equip.available < 1)
            return res.status(400).json({ message: "Equipment not available" });

        const booking = await Booking.create({
            user: req.user.id, equipment: equipmentId, returnBy, notes
        });

        // Decrement equipment count + increment student's weekly quota
        await Equipment.findByIdAndUpdate(equipmentId, { $inc: { available: -1 } });
        await User.findByIdAndUpdate(req.user.id, { $inc: { weeklyQuotaUsed: 1 } });

        res.status(201).json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/return  (Student — return equipment)
router.put("/:id/return", protect, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status: "completed", returnedOn: new Date() },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        await Equipment.findByIdAndUpdate(booking.equipment, { $inc: { available: 1 } });

        // Promote next waitlisted student (if any)
        await promoteWaitlisted(booking.equipment);

        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/extend  (Student — extend a booking)
router.put("/:id/extend", protect, async (req, res) => {
    try {
        const { days } = req.body;
        const booking  = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        const newReturn = new Date(booking.returnBy);
        newReturn.setDate(newReturn.getDate() + days);
        booking.extended    = true;
        booking.extendDays  = days;
        booking.newReturnBy = newReturn;
        await booking.save();
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/cancel  (Student — cancel a pending booking)
router.put("/:id/cancel", protect, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id, status: "pending" },
            { status: "cancelled" },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Booking not found or not cancellable" });

        await Equipment.findByIdAndUpdate(booking.equipment, { $inc: { available: 1 } });

        // Decrement quota and promote next waitlisted student
        const User = require("../models/User");
        await User.findByIdAndUpdate(req.user.id, { $inc: { weeklyQuotaUsed: -1 } });
        await promoteWaitlisted(booking.equipment);

        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/approve  (Admin — approve pending booking)
router.put("/:id/approve", protect, adminOnly, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "active", approvedBy: req.user.name },
            { new: true }
        );
        res.json(booking);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
