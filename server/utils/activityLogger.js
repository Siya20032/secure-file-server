const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({
    user,
    action,
    file = null,
    targetUser = null,
    details = "",
    ipAddress = ""
}) => {
    try {

        await ActivityLog.create({
            user,
            action,
            file,
            targetUser,
            details,
            ipAddress
        });

        console.log("Activity logged:", action);

    } catch (error) {

        console.error(
            "Activity logging error:",
            error.message
        );
    }
};

module.exports = logActivity;