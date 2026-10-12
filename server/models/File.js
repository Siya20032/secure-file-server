const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        // ==========================================
        // BASIC FILE INFORMATION
        // ==========================================

        originalName: {
            type: String,
            required: true,
            trim: true
        },

        filename: {
            type: String,
            required: true
        },

        path: {
            type: String,
            required: true
        },

        size: {
            type: Number,
            required: true
        },

        mimeType: {
            type: String,
            required: true
        },

        // ==========================================
        // SHA-256 FILE HASH
        // ==========================================

        hash: {
            type: String,
            required: true,
            index: true
        },

        // ==========================================
        // FILE OWNER
        // ==========================================

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==========================================
        // FILE LOCKING
        // ==========================================

        isLocked: {
            type: Boolean,
            default: false
        },

        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        lockedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;