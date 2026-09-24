const express = require("express");
const router  = express.Router();
const Bundle  = require("../models/Bundle");
const Booking = require("../models/Booking");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/bundles            (Student - list all active bundles)
router.get("/", protect, async (req, res) => {
    try {
        const bundles = await Bundle.find({ active: true });
        res.json(bundles);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bundles           (Admin - create a bundle)
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const bundle = await Bundle.create(req.body);
        res.status(201).json(bundle);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bundles/:id/book  (Student - book an entire bundle)
router.post("/:id/book", protect, async (req, res) => {
    try {
        const bundle = await Bundle.findById(req.params.id).populate("equipmentRefs");
        if (!bundle || bundle.stock === "Out of Stock")
            return res.status(400).json({ message: "Bundle not available" });

        const { returnBy } = req.body;
        // Create individual bookings for each equipment in the bundle
        const bookings = await Promise.all(
            bundle.equipmentRefs.map(eq =>
                Booking.create({ user: req.user.id, equipment: eq._id, returnBy,
                                  notes: `Bundle booking: ${bundle.name}` })
            )
        );
        res.status(201).json({ bundle: bundle.name, bookings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
