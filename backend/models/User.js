const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

/*
 * PERSON 2 TABLE: users
 * Used by: Login, Register, Student Dashboard, Equipment Catalog
 * Fields: name, email, password, role, department, studentId, avatar
 */
const UserSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true, minlength: 6 },
    role:         { type: String, enum: ["student", "admin"], default: "student" },
    department:   { type: String, default: "" },
    studentId:    { type: String, default: "" },
    avatar:       { type: String, default: "" },
    status:       { type: String, enum: ["active", "restricted"], default: "active" },
    createdAt:    { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
