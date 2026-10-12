const express = require("express");

const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get(
    "/",
    protect,
    async (req, res) => {

        try {

            const notifications =
                await Notification.find({
                    user: req.user.userId
                })
                .populate(
                    "file",
                    "originalName"
                )
                .sort({
                    createdAt: -1
                })
                .limit(100);


            return res.status(200).json({

                message:
                    "Notifications retrieved successfully",

                count:
                    notifications.length,

                notifications
            });

        } catch (error) {

            console.error(
                "Get notifications error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to retrieve notifications"
            });
        }
    }
);


// =====================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// =====================================================

router.get(
    "/unread-count",
    protect,
    async (req, res) => {

        try {

            const count =
                await Notification.countDocuments({

                    user:
                        req.user.userId,

                    isRead:
                        false
                });


            return res.status(200).json({

                count
            });

        } catch (error) {

            console.error(
                "Unread notification count error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to get unread notification count"
            });
        }
    }
);


// =====================================================
// MARK ONE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// =====================================================

router.put(
    "/:id/read",
    protect,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user.userId
                });


            if (!notification) {

                return res.status(404).json({

                    message:
                        "Notification not found"
                });
            }


            notification.isRead =
                true;

            await notification.save();


            return res.status(200).json({

                message:
                    "Notification marked as read",

                notification
            });

        } catch (error) {

            console.error(
                "Mark notification read error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to mark notification as read"
            });
        }
    }
);


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
// =====================================================

router.put(
    "/read-all",
    protect,
    async (req, res) => {

        try {

            await Notification.updateMany(

                {
                    user:
                        req.user.userId,

                    isRead:
                        false
                },

                {
                    $set: {
                        isRead: true
                    }
                }
            );


            return res.status(200).json({

                message:
                    "All notifications marked as read"
            });

        } catch (error) {

            console.error(
                "Mark all notifications read error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to mark all notifications as read"
            });
        }
    }
);


// =====================================================
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================================

router.delete(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user.userId
                });


            if (!notification) {

                return res.status(404).json({

                    message:
                        "Notification not found"
                });
            }


            await Notification.findByIdAndDelete(
                req.params.id
            );


            return res.status(200).json({

                message:
                    "Notification deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete notification error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to delete notification"
            });
        }
    }
);


module.exports = router;