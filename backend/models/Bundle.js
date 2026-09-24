const mongoose = require("mongoose");

/*
 * PERSON 3 TABLE: bundles
 * Used by: Bundle Booking page
 * Fields: name, description, items (equipment refs), stock, demand
 */
const BundleSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
    description:  { type: String, default: "" },
    image:        { type: String, default: "" },
    items:        [{ type: String }],                          // equipment names list
    equipmentRefs:[{ type: mongoose.Schema.Types.ObjectId, ref: "Equipment" }],
    stock:        { type: String, enum: ["Available","Low Stock","Out of Stock"],
                    default: "Available" },
    demand:       { type: String, default: "" },               // e.g. "High Demand"
    active:       { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Bundle", BundleSchema);
