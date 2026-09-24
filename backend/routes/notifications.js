const express       = require("express");
const router        = express.Router();
const Notification  = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/notifications      (Student - get my notifications)
router.get("/", protect, async (req, res) => {
    try {
        const filter = { user: req.user.id };
        if (req.query.filter === "unread")   filter.read     = false;
        if (req.query.filter === "archived") filter.archived = true;
        else filter.archived = false;
        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/notifications/count  (Student Dashboard badge count)
router.get("/count", protect, async (req, res) => {
    try {
        const unread = await Notification.countDocuments({ user: req.user.id, read: false, archived: false });
        res.json({ unread });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/:id/read  (Student - mark one as read)
router.put("/:id/read", protect, async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, { read: true }, { new: true });
        res.json(notif);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/read-all  (Student - mark all as read)
router.put("/read-all", protect, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ message: "All marked as read" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/:id/archive  (Student - archive a notification)
router.put("/:id/archive", protect, async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, { archived: true }, { new: true });
        res.json(notif);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/notifications     (Admin - send notification to a user)
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const notif = await Notification.create(req.body);
        res.status(201).json(notif);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
