const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/students           (Admin - Student Management: list all students)
router.get("/", protect, adminOnly, async (req, res) => {
    try {
        const filter = { role: "student" };
        if (req.query.department) filter.department = req.query.department;
        if (req.query.status)     filter.status     = req.query.status;
        if (req.query.search)     filter.name = { $regex: req.query.search, $options: "i" };
        const students = await User.find(filter).select("-password");
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/students/stats     (Admin Dashboard - student count stats)
router.get("/stats", protect, adminOnly, async (req, res) => {
    try {
        const total      = await User.countDocuments({ role: "student" });
        const active     = await User.countDocuments({ role: "student", status: "active" });
        const restricted = await User.countDocuments({ role: "student", status: "restricted" });
        res.json({ total, active, restricted });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/students          (Admin - Add a new student)
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { name, email, department, studentId } = req.body;
        if (await User.findOne({ email }))
            return res.status(400).json({ message: "Email already exists" });
        const student = await User.create({
            name, email, password: "Student@123", role: "student", department, studentId
        });
        res.status(201).json({ id: student._id, name: student.name, email: student.email });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/students/:id/status  (Admin - Restrict or clear a student)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;   // "active" or "restricted"
        const student = await User.findByIdAndUpdate(
            req.params.id, { status }, { new: true }).select("-password");
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
