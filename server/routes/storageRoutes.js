const express = require("express");
const router = express.Router();

const File = require("../models/File");
const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// STORAGE CONFIGURATION
// ==========================================

// Initial storage quota per user.
// 100 GB = 100 * 1024 * 1024 * 1024 bytes
const STORAGE_QUOTA =
    100 * 1024 * 1024 * 1024;


// ==========================================
// GET MY STORAGE
// ==========================================
//
// GET /api/storage/my
//
// Returns:
//
// - Used storage
// - Storage quota
// - Remaining storage
// - Storage percentage
// - Number of files
//
// ==========================================

router.get(
    "/my",
    authMiddleware,
    async (req, res) => {

        try {

            // ======================================
            // GET USER ID FROM AUTHENTICATED USER
            // ======================================

            const userId =
                req.user.userId ||
                req.user.id ||
                req.user._id;


            if (!userId) {

                return res.status(401).json({

                    success: false,

                    message:
                        "User authentication information missing"

                });

            }


            // ======================================
            // GET ALL FILES BELONGING TO USER
            // ======================================

            const files =
                await File.find(
                    {
                        owner: userId
                    }
                ).select("size");


            // ======================================
            // CALCULATE USED STORAGE
            // ======================================

            const usedBytes =
                files.reduce(
                    (total, file) => {

                        return total +
                            Number(file.size || 0);

                    },
                    0
                );


            // ======================================
            // CALCULATE REMAINING STORAGE
            // ======================================

            const remainingBytes =
                Math.max(
                    STORAGE_QUOTA - usedBytes,
                    0
                );


            // ======================================
            // CALCULATE PERCENTAGE
            // ======================================

            const percentage =
                STORAGE_QUOTA > 0
                    ? (usedBytes / STORAGE_QUOTA) * 100
                    : 0;


            // ======================================
            // RESPONSE
            // ======================================

            return res.status(200).json({

                success: true,

                message:
                    "Storage information retrieved successfully",

                storage: {

                    usedBytes,

                    quotaBytes:
                        STORAGE_QUOTA,

                    remainingBytes,

                    percentage:
                        Number(
                            Math.min(
                                percentage,
                                100
                            ).toFixed(2)
                        ),

                    fileCount:
                        files.length

                }

            });

        } catch (error) {

            console.error(
                "Get storage error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to retrieve storage information"

            });

        }

    }
);


module.exports = router;