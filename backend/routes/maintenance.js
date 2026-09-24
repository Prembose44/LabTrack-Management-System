const express      = require("express");
const router       = express.Router();
const Maintenance  = require("../models/Maintenance");
const Equipment    = require("../models/Equipment");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/maintenance        (Admin - list all maintenance logs)
router.get("/", protect, adminOnly, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const logs = await Maintenance.find(filter).populate("equipment", "name equipmentId");
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/maintenance/stats  (Admin Dashboard - uptime and open log count)
router.get("/stats", protect, adminOnly, async (req, res) => {
    try {
        const openLogs = await Maintenance.countDocuments({ status: { $ne: "resolved" } });
        const total    = await Equipment.countDocuments();
        const inRepair = await Maintenance.countDocuments({ status: "in-repair" });
        const uptime   = total > 0 ? Math.round(((total - inRepair) / total) * 100) : 100;
        res.json({ openLogs, uptime });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/maintenance       (Admin - Report new damage/maintenance)
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { equipment, reportedBy, issue, priority, location, estimatedReturn } = req.body;
        const log = await Maintenance.create({
            equipment, reportedBy, issue, priority, location, estimatedReturn
        });
        // Mark equipment as maintenance
        await Equipment.findByIdAndUpdate(equipment, { status: "maintenance" });
        res.status(201).json(log);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/maintenance/:id    (Admin - Update maintenance status)
router.put("/:id", protect, adminOnly, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const update = { status, notes };
        if (status === "resolved") {
            update.resolvedAt = new Date();
            const log = await Maintenance.findById(req.params.id);
            if (log) await Equipment.findByIdAndUpdate(log.equipment, { status: "available" });
        }
        const log = await Maintenance.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(log);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
