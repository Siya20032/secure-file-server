import React, { useEffect, useState } from "react";

import {
    getFileVersions,
    uploadFileVersion,
    downloadFileVersion,
    restoreFileVersion,
} from "../api";


// =====================================================
// VERSION HISTORY COMPONENT
// =====================================================

const VersionHistory = ({
    file,
    onClose,
    onVersionChanged,
}) => {

    const [versions, setVersions] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(1);

    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);

    const [downloading, setDownloading] = useState(null);

    const [restoring, setRestoring] = useState(null);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);


    // =================================================
    // LOAD VERSION HISTORY
    // =================================================

    const loadVersions = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await getFileVersions(file.id);

            setVersions(
                response.versions || []
            );

            setCurrentVersion(
                response.file?.currentVersion || 1
            );

        } catch (error) {

            console.error(
                "Version history error:",
                error
            );

            setError(
                error.message ||
                "Failed to load version history"
            );

        } finally {

            setLoading(false);
        }
    };


    // =================================================
    // LOAD WHEN COMPONENT OPENS
    // =================================================

    useEffect(() => {

        if (file?.id) {

            loadVersions();
        }

    }, [file?.id]);


    // =================================================
    // SELECT FILE
    // =================================================

    const handleFileSelect = (event) => {

        const selected =
            event.target.files?.[0];

        if (!selected) {
            return;
        }

        setSelectedFile(selected);

        setError("");

        setSuccess("");
    };


    // =================================================
    // UPLOAD NEW VERSION
    // =================================================

    const handleUploadVersion = async () => {

        if (!selectedFile) {

            setError(
                "Please select a file first."
            );

            return;
        }


        try {

            setUploading(true);

            setError("");

            setSuccess("");


            await uploadFileVersion(
                file.id,
                selectedFile
            );


            setSelectedFile(null);


            // Reset file input
            const input =
                document.getElementById(
                    "version-file-input"
                );

            if (input) {

                input.value = "";
            }


            setSuccess(
                "New version uploaded successfully."
            );


            await loadVersions();


            if (onVersionChanged) {

                onVersionChanged();
            }

        } catch (error) {

            console.error(
                "Upload version error:",
                error
            );

            setError(
                error.message ||
                "Failed to upload new version"
            );

        } finally {

            setUploading(false);
        }
    };


    // =================================================
    // DOWNLOAD VERSION
    // =================================================

    const handleDownload = async (
        version
    ) => {

        try {

            setDownloading(version);

            setError("");


            const blob =
                await downloadFileVersion(
                    file.id,
                    version
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                `${getBaseName(file.originalName)}_v${version}${getExtension(file.originalName)}`;


            document.body.appendChild(link);

            link.click();

            link.remove();


            window.URL.revokeObjectURL(
                url
            );

        } catch (error) {

            console.error(
                "Download version error:",
                error
            );

            setError(
                error.message ||
                "Failed to download version"
            );

        } finally {

            setDownloading(null);
        }
    };


    // =================================================
    // RESTORE VERSION
    // =================================================

    const handleRestore = async (
        version
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to restore Version ${version}?\n\nThis will create a new version and will not delete existing versions.`
            );


        if (!confirmed) {
            return;
        }


        try {

            setRestoring(version);

            setError("");

            setSuccess("");


            await restoreFileVersion(
                file.id,
                version
            );


            setSuccess(
                `Version ${version} restored successfully.`
            );


            await loadVersions();


            if (onVersionChanged) {

                onVersionChanged();
            }

        } catch (error) {

            console.error(
                "Restore version error:",
                error
            );

            setError(
                error.message ||
                "Failed to restore version"
            );

        } finally {

            setRestoring(null);
        }
    };


    // =================================================
    // FILE NAME HELPERS
    // =================================================

    const getExtension = (name = "") => {

        const index =
            name.lastIndexOf(".");

        if (index === -1) {
            return "";
        }

        return name.substring(index);
    };


    const getBaseName = (name = "") => {

        const extension =
            getExtension(name);

        if (!extension) {
            return name;
        }

        return name.substring(
            0,
            name.length - extension.length
        );
    };


    // =================================================
    // CLOSE
    // =================================================

    const handleClose = () => {

        if (uploading) {
            return;
        }

        onClose();
    };


    // =================================================
    // UI
    // =================================================

    return (

        <div
            className="version-modal-overlay"
            onClick={handleClose}
        >

            <div
                className="version-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="version-modal-header">

                    <div>

                        <h2>
                            Version History
                        </h2>

                        <p>
                            {file.originalName}
                        </p>

                    </div>


                    <button
                        className="version-close-btn"
                        onClick={handleClose}
                    >
                        ×
                    </button>

                </div>


                {/* =====================================
                    MESSAGES
                ====================================== */}

                {error && (

                    <div className="version-error">

                        {error}

                    </div>

                )}


                {success && (

                    <div className="version-success">

                        {success}

                    </div>

                )}


                {/* =====================================
                    UPLOAD NEW VERSION
                ====================================== */}

                <div className="version-upload-section">

                    <h3>
                        Upload New Version
                    </h3>

                    <div className="version-upload-row">

                        <input
                            id="version-file-input"
                            type="file"
                            onChange={
                                handleFileSelect
                            }
                            disabled={uploading}
                        />


                        <button
                            className="version-upload-btn"
                            onClick={
                                handleUploadVersion
                            }
                            disabled={
                                uploading ||
                                !selectedFile
                            }
                        >

                            {uploading
                                ? "Uploading..."
                                : "Upload Version"
                            }

                        </button>

                    </div>


                    {selectedFile && (

                        <p className="selected-version-file">

                            Selected:
                            {" "}
                            {selectedFile.name}

                        </p>

                    )}

                </div>


                {/* =====================================
                    VERSION LIST
                ====================================== */}

                <div className="version-list-section">

                    <div className="version-list-title">

                        <h3>
                            Versions
                        </h3>

                        <span>
                            Current: v{currentVersion}
                        </span>

                    </div>


                    {loading ? (

                        <div className="version-loading">

                            Loading version history...

                        </div>

                    ) : versions.length === 0 ? (

                        <div className="version-empty">

                            No versions found.

                        </div>

                    ) : (

                        <div className="version-list">

                            {versions.map(
                                (version) => (

                                    <div
                                        className={
                                            `version-item ${
                                                version.isCurrent
                                                    ? "current-version"
                                                    : ""
                                            }`
                                        }
                                        key={
                                            version.id ||
                                            version.version
                                        }
                                    >

                                        {/* VERSION INFO */}

                                        <div className="version-info">

                                            <div className="version-number">

                                                Version
                                                {" "}
                                                {version.version}

                                                {version.isCurrent && (

                                                    <span className="current-badge">

                                                        CURRENT

                                                    </span>

                                                )}

                                            </div>


                                            <div className="version-file-name">

                                                {version.originalName}

                                            </div>


                                            <div className="version-details">

                                                {formatFileSize(
                                                    version.size
                                                )}

                                                {" • "}

                                                {formatDate(
                                                    version.uploadedAt
                                                )}

                                            </div>


                                            {version.uploadedBy && (

                                                <div className="version-uploader">

                                                    Uploaded by:

                                                    {" "}

                                                    {
                                                        version.uploadedBy.name ||
                                                        version.uploadedBy.email ||
                                                        "Unknown user"
                                                    }

                                                </div>

                                            )}

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="version-actions">

                                            <button
                                                className="version-download-btn"
                                                onClick={() =>
                                                    handleDownload(
                                                        version.version
                                                    )
                                                }
                                                disabled={
                                                    downloading ===
                                                    version.version
                                                }
                                            >

                                                {downloading ===
                                                version.version
                                                    ? "Downloading..."
                                                    : "Download"
                                                }

                                            </button>


                                            {!version.isCurrent && (

                                                <button
                                                    className="version-restore-btn"
                                                    onClick={() =>
                                                        handleRestore(
                                                            version.version
                                                        )
                                                    }
                                                    disabled={
                                                        restoring ===
                                                        version.version
                                                    }
                                                >

                                                    {restoring ===
                                                    version.version
                                                        ? "Restoring..."
                                                        : "Restore"
                                                    }

                                                </button>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =====================================
                    FOOTER
                ====================================== */}

                <div className="version-modal-footer">

                    <button
                        className="version-done-btn"
                        onClick={handleClose}
                    >
                        Done
                    </button>

                </div>

            </div>

        </div>
    );
};


// =====================================================
// FORMAT FILE SIZE
// =====================================================

const formatFileSize = (
    bytes
) => {

    if (!bytes || bytes === 0) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        ) +
        " " +
        units[index]
    );
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (
    date
) => {

    if (!date) {
        return "Unknown date";
    }


    try {

        return new Date(
            date
        ).toLocaleString();

    } catch {

        return "Unknown date";
    }
};


export default VersionHistory;