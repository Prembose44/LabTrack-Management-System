const mongoose = require("mongoose");

/*
 * PERSON 1 TABLE: maintenance
 * Used by: Maintenance Tracking page (Admin)
 * Fields: equipment, reportedBy, issue, status, estimatedReturn, priority
 */
const MaintenanceSchema = new mongoose.Schema({
    equipment:    { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    reportedBy:   { type: String, required: true },
    issue:        { type: String, required: true },
    status:       { type: String, enum: ["open","in-repair","resolved"], default: "open" },
    priority:     { type: String, enum: ["low","medium","high","critical"], default: "medium" },
    location:     { type: String, default: "" },
    estimatedReturn: { type: Date, default: null },
    resolvedAt:   { type: Date, default: null },
    notes:        { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
