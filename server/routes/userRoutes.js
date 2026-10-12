
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

router.get("/profile", protect, async (req, res) => {
    try {

        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {

        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// UPDATE PROFILE
// ==========================================

router.put("/profile", protect, async (req, res) => {
    try {

        const {
            name,
            email
        } = req.body;


        // Validate fields

        if (!name || !email) {

            return res.status(400).json({
                message: "Name and email are required"
            });
        }


        // Find authenticated user

        const user = await User.findById(
            req.user.userId
        );

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }


        // Check whether email is already used

        const existingUser =
            await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: req.user.userId }
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email is already registered with another account"
            });
        }


        // Update values

        user.name = name.trim();

        user.email =
            email.toLowerCase().trim();


        await user.save();


        // Do not send password

        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };


        res.status(200).json({
            message:
                "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put("/change-password", protect, async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });
        }


        if (newPassword.length < 6) {

            return res.status(400).json({
                message:
                    "New password must be at least 6 characters"
            });
        }


        // IMPORTANT:
        // Never trust userId from the browser.
        // Get the user ID from the verified JWT.

        const user =
            await User.findById(req.user.userId);


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }


        const isMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({
                message:
                    "Current password is incorrect"
            });
        }


        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        user.password =
            hashedPassword;


        await user.save();


        return res.status(200).json({
            message:
                "Password changed successfully"
        });

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;

