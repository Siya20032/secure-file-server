const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true,
            enum: [
                "LOGIN",
                "LOGOUT",
                "REGISTER",
                "UPLOAD",
                "DOWNLOAD",
                "RENAME",
                "DELETE",
                "SHARE",
                "UNSHARE",
                "CHANGE_PERMISSION",
                "CHANGE_ROLE",
                "DELETE_USER",

                // File Locking
                "LOCK",
                "UNLOCK"
            ]
        },

        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            default: null
        },

        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        details: {
            type: String,
            default: ""
        },

        ipAddress: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ActivityLog",
    activityLogSchema
);
