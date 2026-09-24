const mongoose = require("mongoose");

/*
 * PERSON 3 TABLE: notifications
 * Used by: Notifications page, Student Dashboard badge count
 * Fields: user, title, message, type, read, archived, link
 */
const NotificationSchema = new mongoose.Schema({
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:        { type: String, required: true },
    message:      { type: String, required: true },
    type:         { type: String,
                    enum: ["booking_approved","return_reminder","maintenance","new_equipment","general"],
                    default: "general" },
    icon:         { type: String, default: "Info" },
    iconBg:       { type: String, default: "#e5e7eb" },
    iconColor:    { type: String, default: "#6b7280" },
    link:         { type: String, default: "" },
    read:         { type: Boolean, default: false },
    archived:     { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
