
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = path.resolve(
    process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads")
);

// Create the upload directory automatically.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const File = require("../models/File");
const FileVersion = require("../models/FileVersion");
const Share = require("../models/Share");
const protect = require("../middleware/authMiddleware");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

// =====================================================
// SHA-256 HASH FUNCTION
// =====================================================

const calculateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (data) => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
};

// =====================================================
// MULTER STORAGE CONFIGURATION
// =====================================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            crypto.randomBytes(16).toString("hex") +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = function (req, file, cb) {
    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File type not allowed"), false);
    }
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});

// =====================================================
// UPLOAD NEW FILE
// POST /api/files/upload
// =====================================================

router.post(
    "/upload",
    protect,
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Please select a file"
                });
            }

            const fileHash = await calculateFileHash(req.file.path);

            console.log("SHA-256:", fileHash);

            // Detect duplicates belonging to the same owner.
            const existingFile = await File.findOne({
                owner: req.user.userId,
                hash: fileHash
            });

            if (existingFile) {
                if (req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(409).json({
                    message:
                        "Duplicate file detected. This file has already been uploaded.",
                    duplicate: true,
                    file: {
                        id: existingFile._id,
                        originalName: existingFile.originalName,
                        size: existingFile.size,
                        mimeType: existingFile.mimeType,
                        hash: existingFile.hash,
                        uploadedAt: existingFile.createdAt
                    }
                });
            }

            const file = await File.create({
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimeType: req.file.mimetype,
                hash: fileHash,
                owner: req.user.userId
            });

            // Save the first version.
            await FileVersion.create({
                file: file._id,
                version: 1,
                filename: file.filename,
                originalName: file.originalName,
                path: file.path,
                size: file.size,
                mimeType: file.mimeType,
                uploadedBy: req.user.userId
            });

            await logActivity({
                user: req.user.userId,
                action: "UPLOAD",
                file: file._id,
                details: `Uploaded ${file.originalName} as Version 1`,
                ipAddress: req.ip
            });

            return res.status(201).json({
                message: "File uploaded successfully",
                file: {
                    id: file._id,
                    originalName: file.originalName,
                    filename: file.filename,
                    size: file.size,
                    mimeType: file.mimeType,
                    hash: file.hash,
                    owner: file.owner,
                    currentVersion: 1,
                    isLocked: file.isLocked,
                    lockedBy: file.lockedBy,
                    lockedAt: file.lockedAt,
                    uploadedAt: file.createdAt
                }
            });
        } catch (error) {
            console.error("File upload error:", error.message);

            if (req.file?.path && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error(
                        "Failed to clean uploaded file:",
                        cleanupError.message
                    );
                }
            }

            return res.status(500).json({
                message: "File upload failed"
            });
        }
    }
);

// =====================================================
// GET MY FILES
// GET /api/files
// GET /api/files?search=document
// GET /api/files?type=pdf
// GET /api/files?page=1&limit=10
// =====================================================

router.get("/", protect, async (req, res) => {
    try {
        const {
            search,
            type,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);

        const filesPerPage = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            50
        );

        const skip = (currentPage - 1) * filesPerPage;

        const query = {
            owner: req.user.userId
        };

        if (search && search.trim()) {
            query.originalName = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        if (type) {
            const fileTypes = {
                pdf: "application/pdf",
                image: {
                    $in: ["image/jpeg", "image/png"]
                },
                text: "text/plain",
                word: {
                    $in: [
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ]
                }
            };

            const selectedType = fileTypes[type.toLowerCase()];

            if (!selectedType) {
                return res.status(400).json({
                    message:
                        "Invalid file type. Use pdf, image, text or word."
                });
            }

            query.mimeType = selectedType;
        }

        const totalFiles = await File.countDocuments(query);

        const files = await File.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(filesPerPage);

        const filesWithVersions = await Promise.all(
            files.map(async (file) => {
                const latestVersion = await FileVersion.findOne({
                    file: file._id
                }).sort({ version: -1 });

                return {
                    ...file.toObject(),
                    currentVersion: latestVersion
                        ? latestVersion.version
                        : 1
                };
            })
        );

        const totalPages = Math.ceil(totalFiles / filesPerPage);

        return res.status(200).json({
            message: "Files retrieved successfully",
            count: filesWithVersions.length,
            pagination: {
                currentPage,
                filesPerPage,
                totalFiles,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            },
            files: filesWithVersions
        });
    } catch (error) {
        console.error("Get files error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve files"
        });
    }
});

// =====================================================
// LOCK FILE
// PUT /api/files/:id/lock
// =====================================================

router.put("/:id/lock", protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const isOwner =
            file.owner.toString() === req.user.userId;

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the file owner can lock this file"
            });
        }

        if (file.isLocked) {
            return res.status(409).json({
                message: "File is already locked",
                lockedBy: file.lockedBy,
                lockedAt: file.lockedAt
            });
        }

        file.isLocked = true;
        file.lockedBy = req.user.userId;
        file.lockedAt = new Date();

        await file.save();

        await logActivity({
            user: req.user.userId,
            action: "LOCK",
            file: file._id,
            details: `Locked ${file.originalName}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "File locked successfully",
            file: {
                id: file._id,
                originalName: file.originalName,
                isLocked: file.isLocked,
                lockedBy: file.lockedBy,
                lockedAt: file.lockedAt
            }
        });
    } catch (error) {
        console.error("Lock file error:", error.message);

        return res.status(500).json({
            message: "File locking failed"
        });
    }
});

// =====================================================
// UNLOCK FILE
// PUT /api/files/:id/unlock
// =====================================================

router.put("/:id/unlock", protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const isOwner =
            file.owner.toString() === req.user.userId;

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the file owner can unlock this file"
            });
        }

        if (!file.isLocked) {
            return res.status(409).json({
                message: "File is not currently locked"
            });
        }

        file.isLocked = false;
        file.lockedBy = null;
        file.lockedAt = null;

        await file.save();

        await logActivity({
            user: req.user.userId,
            action: "UNLOCK",
            file: file._id,
            details: `Unlocked ${file.originalName}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "File unlocked successfully",
            file: {
                id: file._id,
                originalName: file.originalName,
                isLocked: file.isLocked,
                lockedBy: file.lockedBy,
                lockedAt: file.lockedAt
            }
        });
    } catch (error) {
        console.error("Unlock file error:", error.message);

        return res.status(500).json({
            message: "File unlocking failed"
        });
    }
});

// =====================================================
// UPLOAD NEW FILE VERSION
// POST /api/files/:id/version
// =====================================================

router.post(
    "/:id/version",
    protect,
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Please select a file for the new version"
                });
            }

            const file = await File.findById(req.params.id);

            if (!file) {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    message: "File not found"
                });
            }

            const isOwner =
                file.owner.toString() === req.user.userId;

            let share = null;

            if (!isOwner) {
                share = await Share.findOne({
                    file: file._id,
                    sharedWith: req.user.userId
                });

                if (!share) {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(403).json({
                        message: "Access denied"
                    });
                }

                if (share.permission.toLowerCase() !== "write") {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(403).json({
                        message:
                            "Write permission required to upload a new version"
                    });
                }
            }

            if (file.isLocked) {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(403).json({
                    message:
                        "File is locked. Unlock the file before uploading a new version."
                });
            }

            const versionHash = await calculateFileHash(req.file.path);

            console.log("New version SHA-256:", versionHash);

            const latestVersion = await FileVersion.findOne({
                file: file._id
            }).sort({ version: -1 });

            const newVersionNumber = latestVersion
                ? latestVersion.version + 1
                : 1;

            let newVersion;

            try {
                newVersion = await FileVersion.create({
                    file: file._id,
                    version: newVersionNumber,
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    path: req.file.path,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    uploadedBy: req.user.userId
                });
            } catch (versionError) {
                if (versionError.code === 11000) {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(409).json({
                        message:
                            "Another version was created at the same time. Please upload again."
                    });
                }

                throw versionError;
            }

            file.originalName = req.file.originalname;
            file.filename = req.file.filename;
            file.path = req.file.path;
            file.size = req.file.size;
            file.mimeType = req.file.mimetype;
            file.hash = versionHash;

            await file.save();

            await logActivity({
                user: req.user.userId,
                action: "UPLOAD",
                file: file._id,
                details:
                    `Uploaded Version ${newVersionNumber} of ${file.originalName}`,
                ipAddress: req.ip
            });

            return res.status(201).json({
                message: `Version ${newVersionNumber} uploaded successfully`,
                version: {
                    id: newVersion._id,
                    file: newVersion.file,
                    version: newVersion.version,
                    originalName: newVersion.originalName,
                    filename: newVersion.filename,
                    size: newVersion.size,
                    mimeType: newVersion.mimeType,
                    uploadedBy: newVersion.uploadedBy,
                    uploadedAt: newVersion.createdAt
                },
                hash: versionHash
            });
        } catch (error) {
            console.error("Upload new version error:", error.message);

            if (req.file?.path && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error(
                        "Failed to clean uploaded file:",
                        cleanupError.message
                    );
                }
            }

            return res.status(500).json({
                message: "Failed to upload new version"
            });
        }
    }
);

// =====================================================
// GET VERSION HISTORY
// GET /api/files/:id/versions
// =====================================================

router.get("/:id/versions", protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const isOwner =
            file.owner.toString() === req.user.userId;

        if (!isOwner) {
            const share = await Share.findOne({
                file: file._id,
                sharedWith: req.user.userId
            });

            if (!share) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }
        }

        const versions = await FileVersion.find({
            file: file._id
        })
            .populate("uploadedBy", "name email")
            .sort({ version: -1 });

        const latestVersion =
            versions.length > 0 ? versions[0].version : 1;

        return res.status(200).json({
            message: "Version history retrieved successfully",
            file: {
                id: file._id,
                originalName: file.originalName,
                currentVersion: latestVersion,
                isLocked: file.isLocked,
                hash: file.hash
            },
            count: versions.length,
            versions: versions.map((version) => ({
                id: version._id,
                version: version.version,
                originalName: version.originalName,
                filename: version.filename,
                size: version.size,
                mimeType: version.mimeType,
                uploadedBy: version.uploadedBy,
                uploadedAt: version.createdAt,
                isCurrent: version.version === latestVersion
            }))
        });
    } catch (error) {
        console.error("Get version history error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve version history"
        });
    }
});

// =====================================================
// DOWNLOAD SPECIFIC VERSION
// GET /api/files/:id/versions/:version/download
// =====================================================

router.get(
    "/:id/versions/:version/download",
    protect,
    async (req, res) => {
        try {
            const versionNumber = parseInt(req.params.version, 10);

            if (isNaN(versionNumber) || versionNumber < 1) {
                return res.status(400).json({
                    message: "Invalid version number"
                });
            }

            const file = await File.findById(req.params.id);

            if (!file) {
                return res.status(404).json({
                    message: "File not found"
                });
            }

            const isOwner =
                file.owner.toString() === req.user.userId;

            if (!isOwner) {
                const share = await Share.findOne({
                    file: file._id,
                    sharedWith: req.user.userId
                });

                if (!share) {
                    return res.status(403).json({
                        message: "Access denied"
                    });
                }
            }

            const version = await FileVersion.findOne({
                file: file._id,
                version: versionNumber
            });

            if (!version) {
                return res.status(404).json({
                    message: `Version ${versionNumber} not found`
                });
            }

            if (!version.path || !fs.existsSync(version.path)) {
                return res.status(404).json({
                    message: "Physical version file not found"
                });
            }

            await logActivity({
                user: req.user.userId,
                action: "DOWNLOAD",
                file: file._id,
                details:
                    `Downloaded Version ${versionNumber} of ${file.originalName}`,
                ipAddress: req.ip
            });

            return res.download(
                version.path,
                version.originalName,
                (error) => {
                    if (error) {
                        console.error(
                            "Version download error:",
                            error.message
                        );
                    }
                }
            );
        } catch (error) {
            console.error("Download version error:", error.message);

            return res.status(500).json({
                message: "Failed to download file version"
            });
        }
    }
);

// =====================================================
// RESTORE VERSION
// PUT /api/files/:id/versions/:version/restore
// =====================================================

router.put(
    "/:id/versions/:version/restore",
    protect,
    async (req, res) => {
        let newPath;

        try {
            const versionNumber = parseInt(req.params.version, 10);

            if (isNaN(versionNumber) || versionNumber < 1) {
                return res.status(400).json({
                    message: "Invalid version number"
                });
            }

            const file = await File.findById(req.params.id);

            if (!file) {
                return res.status(404).json({
                    message: "File not found"
                });
            }

            const isOwner =
                file.owner.toString() === req.user.userId;

            if (!isOwner) {
                const share = await Share.findOne({
                    file: file._id,
                    sharedWith: req.user.userId
                });

                if (!share) {
                    return res.status(403).json({
                        message: "Access denied"
                    });
                }

                if (share.permission.toLowerCase() !== "write") {
                    return res.status(403).json({
                        message:
                            "Write permission required to restore a version"
                    });
                }
            }

            if (file.isLocked) {
                return res.status(403).json({
                    message:
                        "File is locked. Unlock the file before restoring a version."
                });
            }

            const oldVersion = await FileVersion.findOne({
                file: file._id,
                version: versionNumber
            });

            if (!oldVersion) {
                return res.status(404).json({
                    message: `Version ${versionNumber} not found`
                });
            }

            if (!oldVersion.path || !fs.existsSync(oldVersion.path)) {
                return res.status(404).json({
                    message: "Physical version file not found"
                });
            }

            const restoredHash = await calculateFileHash(oldVersion.path);

            const latestVersion = await FileVersion.findOne({
                file: file._id
            }).sort({ version: -1 });

            const newVersionNumber = latestVersion
                ? latestVersion.version + 1
                : 1;

            const newFilename =
                crypto.randomBytes(16).toString("hex") +
                path.extname(oldVersion.originalName);

            // FIX: Always restore into the configured upload directory.
            newPath = path.join(UPLOAD_DIR, newFilename);

            fs.copyFileSync(oldVersion.path, newPath);

            let restoredVersion;

            try {
                restoredVersion = await FileVersion.create({
                    file: file._id,
                    version: newVersionNumber,
                    filename: newFilename,
                    originalName: oldVersion.originalName,
                    path: newPath,
                    size: oldVersion.size,
                    mimeType: oldVersion.mimeType,
                    uploadedBy: req.user.userId
                });
            } catch (versionError) {
                if (newPath && fs.existsSync(newPath)) {
                    fs.unlinkSync(newPath);
                }

                newPath = null;

                if (versionError.code === 11000) {
                    return res.status(409).json({
                        message:
                            "Another version was created at the same time. Please restore again."
                    });
                }

                throw versionError;
            }

            file.originalName = oldVersion.originalName;
            file.filename = newFilename;
            file.path = newPath;
            file.size = oldVersion.size;
            file.mimeType = oldVersion.mimeType;
            file.hash = restoredHash;

            await file.save();

            await logActivity({
                user: req.user.userId,
                action: "UPLOAD",
                file: file._id,
                details:
                    `Restored Version ${versionNumber} as Version ${newVersionNumber}`,
                ipAddress: req.ip
            });

            return res.status(200).json({
                message:
                    `Version ${versionNumber} restored successfully as Version ${newVersionNumber}`,
                version: {
                    id: restoredVersion._id,
                    file: restoredVersion.file,
                    version: restoredVersion.version,
                    originalName: restoredVersion.originalName,
                    filename: restoredVersion.filename,
                    size: restoredVersion.size,
                    mimeType: restoredVersion.mimeType,
                    uploadedBy: restoredVersion.uploadedBy,
                    uploadedAt: restoredVersion.createdAt
                },
                hash: restoredHash
            });
        } catch (error) {
            console.error("Restore version error:", error.message);

            if (newPath && fs.existsSync(newPath)) {
                try {
                    fs.unlinkSync(newPath);
                } catch (cleanupError) {
                    console.error(
                        "Failed to clean restored file:",
                        cleanupError.message
                    );
                }
            }

            return res.status(500).json({
                message: "Failed to restore file version"
            });
        }
    }
);

// =====================================================
// DOWNLOAD CURRENT FILE
// GET /api/files/:id/download
// =====================================================

router.get("/:id/download", protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const isOwner =
            file.owner.toString() === req.user.userId;

        let share = null;

        if (!isOwner) {
            share = await Share.findOne({
                file: file._id,
                sharedWith: req.user.userId
            });
        }

        if (!isOwner && !share) {
            return res.status(403).json({
                message:
                    "Access denied. You do not have permission to access this file."
            });
        }

        if (!file.path || !fs.existsSync(file.path)) {
            return res.status(404).json({
                message: "Physical file not found"
            });
        }

        await logActivity({
            user: req.user.userId,
            action: "DOWNLOAD",
            file: file._id,
            details: `Downloaded ${file.originalName}`,
            ipAddress: req.ip
        });

        return res.download(file.path, file.originalName, (error) => {
            if (error) {
                console.error("File download error:", error.message);
            }
        });
    } catch (error) {
        console.error("Download error:", error.message);

        return res.status(500).json({
            message: "File download failed"
        });
    }
});

// =====================================================
// DELETE FILE
// DELETE /api/files/:id
// =====================================================

router.delete("/:id", protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const isOwner =
            file.owner.toString() === req.user.userId;

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the file owner can delete this file"
            });
        }

        if (file.isLocked) {
            return res.status(403).json({
                message:
                    "File is locked. Unlock the file before deleting it."
            });
        }

        const deletedFileName = file.originalName;

        const versions = await FileVersion.find({
            file: file._id
        });

        const deletedPaths = new Set();

        // Delete the physical files for all versions.
        for (const version of versions) {
            if (
                version.path &&
                !deletedPaths.has(version.path) &&
                fs.existsSync(version.path)
            ) {
                fs.unlinkSync(version.path);
                deletedPaths.add(version.path);
            }
        }

        // Also delete the current file if its path was not in version history.
        if (
            file.path &&
            !deletedPaths.has(file.path) &&
            fs.existsSync(file.path)
        ) {
            fs.unlinkSync(file.path);
        }

        await FileVersion.deleteMany({
            file: file._id
        });

        await File.findByIdAndDelete(req.params.id);

        await Share.deleteMany({
            file: file._id
        });

        await logActivity({
            user: req.user.userId,
            action: "DELETE",
            file: null,
            details: `Deleted ${deletedFileName} and all versions`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "File and all versions deleted successfully"
        });
    } catch (error) {
        console.error("Delete file error:", error.message);

        return res.status(500).json({
            message: "File deletion failed"
        });
    }
});

// =====================================================
// RENAME FILE
// PUT /api/files/:id/rename
// =====================================================

router.put("/:id/rename", protect, async (req, res) => {
    try {
        const { newName, name } = req.body;
        const requestedName = newName || name;

        if (!requestedName || !requestedName.trim()) {
            return res.status(400).json({
                message: "New file name is required"
            });
        }

        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const isOwner =
            file.owner.toString() === req.user.userId;

        if (isOwner) {
            if (file.isLocked) {
                return res.status(403).json({
                    message:
                        "File is locked. Unlock the file before renaming it."
                });
            }

            return renameFile(
                file,
                requestedName,
                res,
                req.user.userId,
                req.ip
            );
        }

        const share = await Share.findOne({
            file: file._id,
            sharedWith: req.user.userId
        });

        if (!share) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        if (file.isLocked) {
            return res.status(403).json({
                message:
                    "File is locked. The owner must unlock it before modifications."
            });
        }

        if (share.permission.toLowerCase() !== "write") {
            return res.status(403).json({
                message: "Write permission required to rename this file"
            });
        }

        return renameFile(
            file,
            requestedName,
            res,
            req.user.userId,
            req.ip
        );
    } catch (error) {
        console.error("Rename file error:", error.message);

        return res.status(500).json({
            message: "File rename failed"
        });
    }
});

// =====================================================
// RENAME FILE HELPER
// =====================================================

async function renameFile(file, newName, res, userId, ipAddress) {
    const oldExtension = path.extname(file.originalName);

    let finalName = newName.trim();

    if (!path.extname(finalName)) {
        finalName += oldExtension;
    }

    file.originalName = finalName;

    await file.save();

    // Update the latest version's display name.
    const latestVersion = await FileVersion.findOne({
        file: file._id
    }).sort({ version: -1 });

    if (latestVersion) {
        latestVersion.originalName = finalName;
        await latestVersion.save();
    }

    await logActivity({
        user: userId,
        action: "RENAME",
        file: file._id,
        details: `Renamed file to ${file.originalName}`,
        ipAddress
    });

    return res.status(200).json({
        message: "File renamed successfully",
        file: {
            id: file._id,
            originalName: file.originalName,
            filename: file.filename,
            size: file.size,
            mimeType: file.mimeType,
            hash: file.hash,
            owner: file.owner,
            isLocked: file.isLocked,
            lockedBy: file.lockedBy,
            lockedAt: file.lockedAt,
            updatedAt: file.updatedAt
        }
    });
}

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
