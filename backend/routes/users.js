const express  = require("express");
const router   = express.Router();
const User     = require("../models/User");
const { protect } = require("../middleware/auth");

// GET /api/users/me    (Student Dashboard - get current user)
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/me    (Profile/Settings page - update profile)
router.put("/me", protect, async (req, res) => {
    try {
        const { name, department, studentId, avatar } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id,
            { name, department, studentId, avatar }, { new: true }).select("-password");
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
