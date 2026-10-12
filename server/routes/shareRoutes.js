const express = require("express");

const Share = require("../models/Share");
const File = require("../models/File");
const User = require("../models/User");

const protect =
    require("../middleware/authMiddleware");

const logActivity =
    require("../utils/activityLogger");

const createNotification =
    require("../utils/notificationHelper");

const {
    sendFileSharedEmail,
    sendPermissionChangeEmail,
    sendAccessRevokedEmail
} = require("../utils/emailHelper");

const router = express.Router();


// =====================================================
// SHARE FILE
// POST /api/shares
// =====================================================

router.post(
    "/",
    protect,
    async (req, res) => {

        try {

            const {
                fileId,
                email,
                permission
            } = req.body;


            // ==========================================
            // VALIDATE INPUT
            // ==========================================

            if (!fileId || !email) {

                return res.status(400).json({

                    message:
                        "File ID and user email are required"

                });
            }


            // ==========================================
            // FIND FILE
            // ==========================================

            const file =
                await File.findById(fileId);


            if (!file) {

                return res.status(404).json({

                    message:
                        "File not found"

                });
            }


            // ==========================================
            // CHECK OWNER
            // ==========================================

            if (
                file.owner.toString() !==
                req.user.userId
            ) {

                return res.status(403).json({

                    message:
                        "Only the file owner can share this file"

                });
            }


            // ==========================================
            // FIND RECIPIENT
            // ==========================================

            const normalizedEmail =
                email
                    .toLowerCase()
                    .trim();


            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (!user) {

                return res.status(404).json({

                    message:
                        "User with this email does not exist"

                });
            }


            // ==========================================
            // FIND SENDER
            // ==========================================

            const sender =
                await User.findById(
                    req.user.userId
                );


            // ==========================================
            // PREVENT SELF SHARING
            // ==========================================

            if (
                user._id.toString() ===
                req.user.userId
            ) {

                return res.status(400).json({

                    message:
                        "You cannot share a file with yourself"

                });
            }


            // ==========================================
            // CHECK PERMISSION
            // ==========================================

            const selectedPermission =
                permission || "read";


            if (
                !["read", "write"].includes(
                    selectedPermission
                )
            ) {

                return res.status(400).json({

                    message:
                        "Permission must be read or write"

                });
            }


            // ==========================================
            // CHECK EXISTING SHARE
            // ==========================================

            const existingShare =
                await Share.findOne({

                    file:
                        fileId,

                    sharedWith:
                        user._id

                });


            if (existingShare) {

                return res.status(409).json({

                    message:
                        "File is already shared with this user"

                });
            }


            // ==========================================
            // CREATE SHARE
            // ==========================================

            const share =
                await Share.create({

                    file:
                        file._id,

                    owner:
                        req.user.userId,

                    sharedWith:
                        user._id,

                    permission:
                        selectedPermission

                });


            // ==========================================
            // ACTIVITY LOG
            // ==========================================

            await logActivity({

                user:
                    req.user.userId,

                action:
                    "SHARE",

                file:
                    file._id,

                targetUser:
                    user._id,

                details:
                    `Shared ${file.originalName} with ${user.email} with ${selectedPermission} permission`,

                ipAddress:
                    req.ip

            });


            // ==========================================
            // IN-APP NOTIFICATION
            // ==========================================

            try {

                await createNotification({

                    user:
                        user._id,

                    message:
                        `${file.originalName} was shared with you with ${selectedPermission} permission.`,

                    type:
                        "SHARE",

                    file:
                        file._id

                });

            } catch (notificationError) {

                console.error(
                    "In-app notification failed:",
                    notificationError.message
                );

            }


            // ==========================================
            // EMAIL NOTIFICATION
            // ==========================================

            try {

                await sendFileSharedEmail({

                    recipientEmail:
                        user.email,

                    recipientName:
                        user.name,

                    senderName:
                        sender?.name || "A user",

                    fileName:
                        file.originalName,

                    permission:
                        selectedPermission

                });

            } catch (emailError) {

                console.error(
                    "Share email notification failed:",
                    emailError.message
                );

            }


            // ==========================================
            // SUCCESS RESPONSE
            // ==========================================

            return res.status(201).json({

                message:
                    "File shared successfully",

                share: {

                    id:
                        share._id,

                    file:
                        share.file,

                    sharedWith:
                        user.email,

                    permission:
                        share.permission,

                    createdAt:
                        share.createdAt

                }

            });

        } catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "SHARE FILE ERROR"
            );

            console.error(
                error
            );

            console.error(
                "================================="
            );


            return res.status(500).json({

                message:
                    "File sharing failed",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });
        }
    }
);


// =====================================================
// GET FILES SHARED WITH ME
// GET /api/shares/with-me
// =====================================================

router.get(
    "/with-me",
    protect,
    async (req, res) => {

        try {

            const shares =
                await Share.find({

                    sharedWith:
                        req.user.userId

                })

                .populate(
                    "file",
                    "originalName filename size mimeType owner createdAt"
                )

                .populate(
                    "owner",
                    "name email"
                );


            return res.status(200).json({

                message:
                    "Shared files retrieved successfully",

                count:
                    shares.length,

                shares

            });

        } catch (error) {

            console.error(
                "Get shared files error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to retrieve shared files"

            });
        }
    }
);


// =====================================================
// GET FILES SHARED BY ME
// GET /api/shares/by-me
// =====================================================

router.get(
    "/by-me",
    protect,
    async (req, res) => {

        try {

            const shares =
                await Share.find({

                    owner:
                        req.user.userId

                })

                .populate(
                    "file",
                    "originalName filename size mimeType createdAt"
                )

                .populate(
                    "sharedWith",
                    "name email"
                );


            return res.status(200).json({

                message:
                    "Files shared by you retrieved successfully",

                count:
                    shares.length,

                shares

            });

        } catch (error) {

            console.error(
                "Get files shared by me error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to retrieve shared files"

            });
        }
    }
);


// =====================================================
// UPDATE SHARE PERMISSION
// PUT /api/shares/:id
// =====================================================

router.put(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const {
                permission
            } = req.body;


            // ==========================================
            // VALIDATE PERMISSION
            // ==========================================

            if (
                !["read", "write"].includes(
                    permission
                )
            ) {

                return res.status(400).json({

                    message:
                        "Permission must be read or write"

                });
            }


            // ==========================================
            // FIND SHARE
            // ==========================================

            const share =
                await Share.findById(
                    req.params.id
                );


            if (!share) {

                return res.status(404).json({

                    message:
                        "Share not found"

                });
            }


            // ==========================================
            // CHECK OWNER
            // ==========================================

            if (
                share.owner.toString() !==
                req.user.userId
            ) {

                return res.status(403).json({

                    message:
                        "Only the file owner can change permission"

                });
            }


            // ==========================================
            // OLD PERMISSION
            // ==========================================

            const oldPermission =
                share.permission;


            // ==========================================
            // GET FILE
            // ==========================================

            const file =
                await File.findById(
                    share.file
                );


            // ==========================================
            // GET RECIPIENT
            // ==========================================

            const recipient =
                await User.findById(
                    share.sharedWith
                );


            // ==========================================
            // UPDATE PERMISSION
            // ==========================================

            share.permission =
                permission;


            await share.save();


            // ==========================================
            // ACTIVITY LOG
            // ==========================================

            await logActivity({

                user:
                    req.user.userId,

                action:
                    "CHANGE_PERMISSION",

                file:
                    share.file,

                targetUser:
                    share.sharedWith,

                details:
                    `Changed permission from ${oldPermission} to ${permission}${file ? ` for ${file.originalName}` : ""}`,

                ipAddress:
                    req.ip

            });


            // ==========================================
            // IN-APP NOTIFICATION
            // ==========================================

            try {

                await createNotification({

                    user:
                        share.sharedWith,

                    message:
                        `Your permission for ${file ? file.originalName : "a shared file"} was changed from ${oldPermission} to ${permission}.`,

                    type:
                        "PERMISSION_CHANGE",

                    file:
                        share.file

                });

            } catch (notificationError) {

                console.error(
                    "Permission notification failed:",
                    notificationError.message
                );

            }


            // ==========================================
            // EMAIL NOTIFICATION
            // ==========================================

            if (recipient) {

                try {

                    await sendPermissionChangeEmail({

                        recipientEmail:
                            recipient.email,

                        recipientName:
                            recipient.name,

                        fileName:
                            file
                                ? file.originalName
                                : "Shared file",

                        oldPermission:
                            oldPermission,

                        newPermission:
                            permission

                    });

                } catch (emailError) {

                    console.error(
                        "Permission email notification failed:",
                        emailError.message
                    );

                }

            }


            // ==========================================
            // RESPONSE
            // ==========================================

            return res.status(200).json({

                message:
                    "Permission updated successfully",

                share

            });

        } catch (error) {

            console.error(
                "Update permission error:",
                error
            );

            return res.status(500).json({

                message:
                    "Permission update failed"

            });
        }
    }
);


// =====================================================
// REVOKE SHARE
// DELETE /api/shares/:id
// =====================================================

router.delete(
    "/:id",
    protect,
    async (req, res) => {

        try {

            // ==========================================
            // FIND SHARE
            // ==========================================

            const share =
                await Share.findById(
                    req.params.id
                );


            if (!share) {

                return res.status(404).json({

                    message:
                        "Share not found"

                });
            }


            // ==========================================
            // CHECK OWNER
            // ==========================================

            if (
                share.owner.toString() !==
                req.user.userId
            ) {

                return res.status(403).json({

                    message:
                        "Only the file owner can revoke this share"

                });
            }


            // ==========================================
            // GET FILE
            // ==========================================

            const file =
                await File.findById(
                    share.file
                );


            // ==========================================
            // GET RECIPIENT
            // ==========================================

            const recipient =
                await User.findById(
                    share.sharedWith
                );


            // ==========================================
            // FILE NAME
            // ==========================================

            const fileName =
                file
                    ? file.originalName
                    : "Unknown file";


            // ==========================================
            // SAVE TARGET USER
            // ==========================================

            const targetUserId =
                share.sharedWith;


            // ==========================================
            // DELETE SHARE
            // ==========================================

            await Share.findByIdAndDelete(
                req.params.id
            );


            // ==========================================
            // ACTIVITY LOG
            // ==========================================

            await logActivity({

                user:
                    req.user.userId,

                action:
                    "UNSHARE",

                file:
                    share.file,

                targetUser:
                    targetUserId,

                details:
                    `Revoked sharing of ${fileName}`,

                ipAddress:
                    req.ip

            });


            // ==========================================
            // IN-APP NOTIFICATION
            // ==========================================

            try {

                await createNotification({

                    user:
                        targetUserId,

                    message:
                        `Your access to ${fileName} has been revoked.`,

                    type:
                        "UNSHARE",

                    file:
                        share.file

                });

            } catch (notificationError) {

                console.error(
                    "Revoke notification failed:",
                    notificationError.message
                );

            }


            // ==========================================
            // EMAIL NOTIFICATION
            // ==========================================

            if (recipient) {

                try {

                    await sendAccessRevokedEmail({

                        recipientEmail:
                            recipient.email,

                        recipientName:
                            recipient.name,

                        fileName:
                            fileName

                    });

                } catch (emailError) {

                    console.error(
                        "Revoke email notification failed:",
                        emailError.message
                    );

                }

            }


            // ==========================================
            // RESPONSE
            // ==========================================

            return res.status(200).json({

                message:
                    "File sharing revoked successfully"

            });

        } catch (error) {

            console.error(
                "Revoke share error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to revoke sharing"

            });
        }
    }
);


module.exports = router;