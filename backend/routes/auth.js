const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");

// Helper: generate token
const generateToken = (user) =>
    jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email },
              process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register   (Register page)
router.post("/register", async (req, res) => {
    const { name, email, password, role, department, studentId } = req.body;
    try {
        if (await User.findOne({ email }))
            return res.status(400).json({ message: "Email already registered" });

        const user = await User.create({ name, email, password, role: role || "student",
                                         department, studentId });
        res.status(201).json({ token: generateToken(user), user: {
            id: user._id, name: user.name, email: user.email, role: user.role
        }});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login   (Login page)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: "Invalid email or password" });

        res.json({ token: generateToken(user), user: {
            id: user._id, name: user.name, email: user.email, role: user.role
        }});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
