const Notification = require("../models/Notification");

/**
 * Create an in-app notification
 *
 * @param {Object} data
 * @param {ObjectId|string} data.user
 * @param {string} data.message
 * @param {string} data.type
 * @param {ObjectId|string|null} data.file
 */

const createNotification = async ({
    user,
    message,
    type = "SYSTEM",
    file = null
}) => {

    try {

        if (!user) {
            throw new Error(
                "Notification user is required"
            );
        }

        if (!message) {
            throw new Error(
                "Notification message is required"
            );
        }

        const notification =
            await Notification.create({

                user,

                message,

                type,

                file
            });

        console.log(
            "Notification created:",
            notification._id
        );

        return notification;

    } catch (error) {

        console.error(
            "Notification creation error:",
            error.message
        );

        throw error;
    }
};


module.exports =
    createNotification;