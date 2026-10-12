const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Check Bearer token format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information
        req.user = decoded;

        // Continue
        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;