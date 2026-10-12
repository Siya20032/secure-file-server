const User = require("../models/User");

const adminOnly = async (req, res, next) => {
    try {

        // Check if authenticated user exists
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Find user in MongoDB
        const user = await User.findById(
            req.user.userId
        );

        // User doesn't exist
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check admin role from database
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        // Store admin user in request
        req.admin = user;

        // Continue to route
        next();

    } catch (error) {

        console.error(
            "Admin authorization error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = adminOnly;