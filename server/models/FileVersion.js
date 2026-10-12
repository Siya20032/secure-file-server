const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema(
    {
        // ==========================================
        // ORIGINAL FILE REFERENCE
        // ==========================================

        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },

        // ==========================================
        // VERSION NUMBER
        // ==========================================

        version: {
            type: Number,
            required: true,
            min: 1
        },

        // ==========================================
        // FILE INFORMATION
        // ==========================================

        filename: {
            type: String,
            required: true
        },

        originalName: {
            type: String,
            required: true,
            trim: true
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
        // USER WHO UPLOADED THIS VERSION
        // ==========================================

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);


// =====================================================
// PREVENT DUPLICATE VERSION NUMBERS
// =====================================================
//
// A single file cannot have:
// Version 1
// Version 1
//
// But different files can both have Version 1.
//
// Example:
//
// File A -> V1, V2, V3
// File B -> V1, V2
//
// =====================================================

fileVersionSchema.index(
    {
        file: 1,
        version: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model(
    "FileVersion",
    fileVersionSchema
);