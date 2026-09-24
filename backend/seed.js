require("dotenv").config();
const mongoose  = require("mongoose");
const User      = require("./models/User");
const Equipment = require("./models/Equipment");
const Booking   = require("./models/Booking");
const Bundle    = require("./models/Bundle");
const Notification = require("./models/Notification");
const Maintenance  = require("./models/Maintenance");

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Clearing collections...");

    await Promise.all([
        User.deleteMany(), Equipment.deleteMany(), Booking.deleteMany(),
        Bundle.deleteMany(), Notification.deleteMany(), Maintenance.deleteMany()
    ]);

    // ── PERSON 2 TABLE: users ──────────────────────────────────────
    const admin = await User.create({
        name: "Admin User", email: "admin@lab.com", password: "Admin@123",
        role: "admin", department: "Administration"
    });
    const student1 = await User.create({
        name: "Prem Bose", email: "prem@uni.edu", password: "Student@123",
        role: "student", department: "Computer Science", studentId: "CS-001"
    });
    const student2 = await User.create({
        name: "Sarah Jenkins", email: "s.jenkins@uni.edu", password: "Student@123",
        role: "student", department: "Mechanical Eng.", studentId: "ENG-4921"
    });
    console.log("Users seeded (Person 2 table)");

    // ── PERSON 1 TABLE: equipment ──────────────────────────────────
    const eq1 = await Equipment.create({
        equipmentId: "EQ-001", name: "Leica DMi8 Microscope", category: "microscope",
        description: "Advanced research microscope for cell imaging.",
        image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
        totalUnits: 5, available: 3, status: "available", location: "Lab 3", department: "Biology"
    });
    const eq2 = await Equipment.create({
        equipmentId: "EQ-042", name: "Beckman Coulter Centrifuge", category: "centrifuge",
        description: "High-speed centrifuge for sample separation.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        totalUnits: 2, available: 0, status: "in-use", location: "Prep Room A", department: "Chemistry"
    });
    const eq3 = await Equipment.create({
        equipmentId: "EQ-003", name: "Oscilloscope DS1054Z", category: "electronics",
        description: "High-precision mixed domain oscilloscope.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        totalUnits: 4, available: 4, status: "available", location: "Electronics Lab", department: "ECE"
    });
    console.log("Equipment seeded (Person 1 table)");

    // ── PERSON 1 TABLE: maintenance ────────────────────────────────
    await Maintenance.create({
        equipment: eq2._id, reportedBy: "Admin User",
        issue: "Motor wear detected during routine check.",
        status: "in-repair", priority: "high",
        location: "Prep Room A",
        estimatedReturn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });
    console.log("Maintenance seeded (Person 1 table)");

    // ── PERSON 3 TABLE: bookings ───────────────────────────────────
    const booking1 = await Booking.create({
        user: student1._id, equipment: eq1._id,
        status: "active", returnBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        approvedBy: "Admin User"
    });
    const booking2 = await Booking.create({
        user: student2._id, equipment: eq3._id,
        status: "pending", returnBy: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });
    console.log("Bookings seeded (Person 3 table)");

    // ── PERSON 3 TABLE: bundles ────────────────────────────────────
    await Bundle.create({
        name: "Electronics Lab Starter Kit",
        description: "Complete set for introductory electronics experiments.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        items: ["Arduino UNO R3", "Breadboard & Jumper Wires", "Digital Multimeter",
                "Oscilloscope DS1054Z", "Power Supply"],
        equipmentRefs: [eq3._id],
        stock: "Available", demand: "High Demand"
    });
    console.log("Bundles seeded (Person 3 table)");

    // ── PERSON 3 TABLE: notifications ─────────────────────────────
    await Notification.create([
        { user: student1._id, title: "Booking Approved",
          message: "Your request for the Leica DMi8 Microscope has been approved.",
          type: "booking_approved", icon: "OK", iconBg: "#d1fae5", iconColor: "#059669",
          link: "my-bookings.html", read: false, archived: false },
        { user: student1._id, title: "Return Reminder",
          message: "The Leica DMi8 Microscope is due for return in 2 days.",
          type: "return_reminder", icon: "!", iconBg: "#fee2e2", iconColor: "#dc2626",
          read: false, archived: false }
    ]);
    console.log("Notifications seeded (Person 3 table)");

    console.log("\n=== SEED COMPLETE ===");
    console.log("Admin login:   admin@lab.com  / Admin@123");
    console.log("Student login: prem@uni.edu   / Student@123");
    process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });
