const mongoose = require("mongoose");

/*
 * PERSON 3 TABLE: bookings
 * Used by: My Bookings, Equipment Details, Bundle Booking, Admin Reports
 * Fields: user, equipment, status, bookedOn, returnBy, extendDays
 */
const BookingSchema = new mongoose.Schema({
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    equipment:    { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    status:       { type: String,
                    enum: ["pending","active","completed","overdue","cancelled"],
                    default: "pending" },
    bookedOn:     { type: Date, default: Date.now },
    returnBy:     { type: Date, required: true },
    returnedOn:   { type: Date, default: null },
    extended:     { type: Boolean, default: false },
    extendDays:   { type: Number, default: 0 },
    newReturnBy:  { type: Date, default: null },
    approvedBy:   { type: String, default: null },
    notes:        { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
