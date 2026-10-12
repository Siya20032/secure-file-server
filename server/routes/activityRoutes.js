const express = require("express");

const ActivityLog = require("../models/ActivityLog");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// =====================================================
// GET MY ACTIVITY
// GET /api/activity/my
// =====================================================

router.get(
    "/my",
    protect,
    async (req, res) => {
        try {
            const logs = await ActivityLog.find({
                user: req.user.userId
            })
                .populate("file", "originalName")
                .populate("targetUser", "name email")
                .sort({
                    createdAt: -1
                })
                .limit(100);

            return res.status(200).json({
                message:
                    "Activity logs retrieved successfully",

                count: logs.length,

                logs
            });
        } catch (error) {
            console.error(
                "Get my activity logs error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve activity logs"
            });
        }
    }
);


// =====================================================
// GET ALL ACTIVITY
// GET /api/activity/all
// ADMIN ONLY
// =====================================================

router.get(
    "/all",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const logs = await ActivityLog.find()
                .populate(
                    "user",
                    "name email role"
                )
                .populate(
                    "file",
                    "originalName"
                )
                .populate(
                    "targetUser",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .limit(500);

            return res.status(200).json({
                message:
                    "All activity logs retrieved successfully",

                count: logs.length,

                logs
            });
        } catch (error) {
            console.error(
                "Get all activity logs error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve activity logs"
            });
        }
    }
);


module.exports = router;