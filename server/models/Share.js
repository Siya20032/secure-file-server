const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
    {
        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sharedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        permission: {
            type: String,
            enum: ["read", "write"],
            default: "read"
        }
    },
    {
        timestamps: true
    }
);


// Prevent OverwriteModelError
module.exports =
    mongoose.models.Share ||
    mongoose.model("Share", shareSchema);