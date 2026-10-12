const express = require("express");
const fs = require("fs");

const User = require("../models/User");
const File = require("../models/File");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// ==========================================
// GET ADMIN DASHBOARD DATA
// GET /api/admin/dashboard
// ==========================================

router.get(
    "/dashboard",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const totalUsers =
                await User.countDocuments();

            const totalFiles =
                await File.countDocuments();

            const files =
                await File.find().select("size");

            let storageUsed = 0;

            files.forEach((file) => {

                storageUsed += file.size || 0;

            });

            const users =
                await User.find()
                    .select("-password")
                    .sort({
                        createdAt: -1
                    });

            return res.status(200).json({

                totalUsers,
                totalFiles,
                storageUsed,
                users

            });

        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );

            return res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==========================================
// CHANGE USER ROLE
// PUT /api/admin/users/:id/role
// ==========================================

router.put(
    "/users/:id/role",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const { role } = req.body;

            if (
                role !== "user" &&
                role !== "admin"
            ) {

                return res.status(400).json({
                    message: "Invalid role"
                });

            }

            const user =
                await User.findById(
                    req.params.id
                );

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }

            // Prevent changing own role

            if (
                user._id.toString() ===
                req.user.userId
            ) {

                return res.status(400).json({

                    message:
                        "You cannot change your own role"

                });

            }

            user.role = role;

            await user.save();

            return res.status(200).json({

                message:
                    "User role updated successfully",

                user: {

                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role

                }

            });

        } catch (error) {

            console.error(
                "Change role error:",
                error
            );

            return res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==========================================
// DELETE USER
// DELETE /api/admin/users/:id
// ==========================================

router.delete(
    "/users/:id",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }

            // Prevent self deletion

            if (
                user._id.toString() ===
                req.user.userId
            ) {

                return res.status(400).json({

                    message:
                        "You cannot delete your own admin account"

                });

            }

            // Find user's files

            const userFiles =
                await File.find({
                    owner: user._id
                });

            // Delete physical files

            for (const file of userFiles) {

                try {

                    if (
                        file.path &&
                        fs.existsSync(file.path)
                    ) {

                        fs.unlinkSync(file.path);

                    }

                } catch (fileError) {

                    console.error(
                        "Error deleting physical file:",
                        file.path,
                        fileError
                    );

                }

            }

            // Delete file records

            await File.deleteMany({
                owner: user._id
            });

            // Delete user

            await User.findByIdAndDelete(
                req.params.id
            );

            return res.status(200).json({

                message:
                    "User and their files deleted successfully"

            });

        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            return res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==========================================
// GET ALL FILES
// GET /api/admin/files
// ==========================================

router.get(
    "/files",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const files =
                await File.find()
                    .populate(
                        "owner",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.status(200).json({

                files

            });

        } catch (error) {

            console.error(
                "Get admin files error:",
                error
            );

            return res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==========================================
// DELETE FILE
// DELETE /api/admin/files/:id
// ==========================================

router.delete(
    "/files/:id",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const file =
                await File.findById(
                    req.params.id
                );

            if (!file) {

                return res.status(404).json({
                    message: "File not found"
                });

            }

            // Delete physical file

            if (
                file.path &&
                fs.existsSync(file.path)
            ) {

                fs.unlinkSync(file.path);

            }

            // Delete database record

            await File.findByIdAndDelete(
                req.params.id
            );

            return res.status(200).json({

                message:
                    "File deleted successfully"

            });

        } catch (error) {

            console.error(
                "Admin file delete error:",
                error
            );

            return res.status(500).json({
                message: "Server error"
            });

        }

    }
);


module.exports = router;