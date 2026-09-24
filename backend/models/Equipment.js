const mongoose = require("mongoose");

/*
 * PERSON 1 TABLE: equipment
 * Used by: Equipment Management (Admin), Equipment Catalog, Equipment Details
 * Fields: name, category, totalUnits, available, status, location, description, image
 */
const EquipmentSchema = new mongoose.Schema({
    equipmentId:  { type: String, required: true, unique: true },  // e.g. EQ-001
    name:         { type: String, required: true, trim: true },
    category:     { type: String, required: true,
                    enum: ["microscope","centrifuge","spectrometer","electronics","other"] },
    description:  { type: String, default: "" },
    image:        { type: String, default: "" },
    totalUnits:   { type: Number, required: true, default: 1 },
    available:    { type: Number, required: true, default: 1 },
    status:       { type: String, enum: ["available","in-use","maintenance"], default: "available" },
    location:     { type: String, default: "" },
    department:   { type: String, default: "" },
    lastMaintained: { type: Date, default: null },
    addedBy:      { type: String, default: "Admin" }
}, { timestamps: true });

module.exports = mongoose.model("Equipment", EquipmentSchema);
