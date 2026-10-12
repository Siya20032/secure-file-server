
const express = require("express");

const PushSubscription = require("../models/PushSubscription");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// SAVE / UPDATE PUSH SUBSCRIPTION
// POST /api/push/subscribe
// =====================================================

router.post(
    "/subscribe",
    protect,
    async (req, res) => {

        try {

            const { subscription } = req.body;

            if (!subscription || !subscription.endpoint) {

                return res.status(400).json({
                    message:
                        "Push subscription is required"
                });
            }


            // Check whether this endpoint already exists

            const existingSubscription =
                await PushSubscription.findOne({
                    endpoint:
                        subscription.endpoint
                });


            if (existingSubscription) {

                existingSubscription.user =
                    req.user.userId;

                existingSubscription.subscription =
                    subscription;

                await existingSubscription.save();

                return res.status(200).json({

                    message:
                        "Push subscription updated successfully"

                });
            }


            // Create new subscription

            await PushSubscription.create({

                user:
                    req.user.userId,

                endpoint:
                    subscription.endpoint,

                subscription

            });


            return res.status(201).json({

                message:
                    "Push subscription saved successfully"

            });

        } catch (error) {

            console.error(
                "Save push subscription error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to save push subscription"

            });
        }
    }
);


// =====================================================
// REMOVE PUSH SUBSCRIPTION
// DELETE /api/push/unsubscribe
// =====================================================

router.delete(
    "/unsubscribe",
    protect,
    async (req, res) => {

        try {

            const { endpoint } = req.body;


            if (!endpoint) {

                return res.status(400).json({

                    message:
                        "Push endpoint is required"

                });
            }


            await PushSubscription.findOneAndDelete({

                user:
                    req.user.userId,

                endpoint

            });


            return res.status(200).json({

                message:
                    "Push subscription removed successfully"

            });

        } catch (error) {

            console.error(
                "Remove push subscription error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to remove push subscription"

            });
        }
    }
);


module.exports = router;

