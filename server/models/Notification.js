const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "SHARE",
                "UNSHARE",
                "PERMISSION_CHANGE",
                "SYSTEM"
            ],
            default: "SYSTEM"
        },

        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);