const express   = require("express");
const router    = express.Router();
const Equipment = require("../models/Equipment");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/equipment          (Catalog - get all equipment, with filters)
router.get("/", protect, async (req, res) => {
    try {
        const filter = {};
        if (req.query.category)  filter.category = req.query.category;
        if (req.query.status)    filter.status   = req.query.status;
        if (req.query.search)    filter.name = { $regex: req.query.search, $options: "i" };
        const equipment = await Equipment.find(filter);
        res.json(equipment);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/equipment/:id      (Equipment Detail page)
router.get("/:id", protect, async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Equipment not found" });
        res.json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/equipment         (Admin - Add new equipment)
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { name, category, totalUnits, available, location, description, image, department } = req.body;
        const count   = await Equipment.countDocuments();
        const equipId = "EQ-" + String(count + 1).padStart(3, "0");
        const item    = await Equipment.create({
            equipmentId: equipId, name, category, totalUnits, available,
            location, description, image, department, addedBy: req.user.name
        });
        res.status(201).json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/equipment/:id      (Admin - Update equipment)
router.put("/:id", protect, adminOnly, async (req, res) => {
    try {
        const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: "Equipment not found" });
        res.json(item);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/equipment/:id   (Admin - Delete equipment)
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: "Equipment removed" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
