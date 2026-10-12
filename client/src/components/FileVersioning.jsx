import React, { useEffect, useRef, useState } from "react";

import {
    uploadFileVersion,
    getFileVersions,
    downloadFileVersion,
    restoreFileVersion,
} from "../api";

const FileVersioning = ({ file, onUpdated }) => {

    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [restoring, setRestoring] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fileInputRef = useRef(null);


    // =====================================================
    // LOAD VERSION HISTORY
    // =====================================================

    const loadVersions = async () => {

        if (!file?.id) return;

        try {

            setLoading(true);
            setError("");

            const response =
                await getFileVersions(file.id);

            setVersions(
                response?.versions || []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to load version history"
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD WHEN FILE CHANGES
    // =====================================================

    useEffect(() => {

        loadVersions();

    }, [file?.id]);


    // =====================================================
    // SELECT FILE
    // =====================================================

    const handleSelectFile = () => {

        if (file?.isLocked) {

            setError(
                "File is locked. Unlock it before uploading a new version."
            );

            return;
        }

        fileInputRef.current?.click();
    };


    // =====================================================
    // UPLOAD NEW VERSION
    // =====================================================

    const handleUploadVersion = async (event) => {

        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) return;


        try {

            setUploading(true);

            setError("");
            setSuccess("");


            await uploadFileVersion(
                file.id,
                selectedFile
            );


            setSuccess(
                "New version uploaded successfully."
            );


            await loadVersions();


            if (onUpdated) {

                await onUpdated();
            }

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to upload new version"
            );

        } finally {

            setUploading(false);

            if (fileInputRef.current) {

                fileInputRef.current.value = "";
            }
        }
    };


    // =====================================================
    // DOWNLOAD VERSION
    // =====================================================

    const handleDownload = async (version) => {

        try {

            setError("");

            const blob =
                await downloadFileVersion(
                    file.id,
                    version.version
                );


            const url =
                window.URL.createObjectURL(blob);


            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                version.originalName ||
                file.originalName ||
                `version-${version.version}`;


            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to download version"
            );
        }
    };


    // =====================================================
    // RESTORE VERSION
    // =====================================================

    const handleRestore = async (version) => {

        if (file?.isLocked) {

            setError(
                "File is locked. Unlock it before restoring a version."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Restore Version ${version.version}?\n\n` +
                `This will create a new version and will not delete existing versions.`
            );


        if (!confirmed) return;


        try {

            setRestoring(version.version);

            setError("");
            setSuccess("");


            await restoreFileVersion(
                file.id,
                version.version
            );


            setSuccess(
                `Version ${version.version} restored successfully.`
            );


            await loadVersions();


            if (onUpdated) {

                await onUpdated();
            }

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to restore version"
            );

        } finally {

            setRestoring(null);
        }
    };


    // =====================================================
    // FORMAT FILE SIZE
    // =====================================================

    const formatSize = (bytes) => {

        if (!bytes) return "0 Bytes";

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
            Math.round(
                bytes /
                Math.pow(1024, index) *
                100
            ) / 100
        ) + " " + units[index];
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleString();
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="versioning-container">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="versioning-header">

                <div>

                    <h2>
                        File Versions
                    </h2>

                    <p>
                        {file?.originalName}
                    </p>

                </div>


                <div className="current-version">

                    Current Version

                    <strong>
                        v{file?.currentVersion || 1}
                    </strong>

                </div>

            </div>


            {/* ================================================= */}
            {/* MESSAGES */}
            {/* ================================================= */}

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


            {/* ================================================= */}
            {/* LOCK STATUS */}
            {/* ================================================= */}

            {file?.isLocked && (

                <div className="version-lock-warning">

                    🔒 File is locked.

                    <br />

                    Unlock the file before uploading
                    or restoring a version.

                </div>
            )}


            {/* ================================================= */}
            {/* UPLOAD */}
            {/* ================================================= */}

            <div className="version-upload">

                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleUploadVersion}
                />


                <button
                    type="button"
                    onClick={handleSelectFile}
                    disabled={
                        uploading ||
                        file?.isLocked
                    }
                    className="upload-version-btn"
                >

                    {uploading
                        ? "Uploading..."
                        : "📤 Upload New Version"
                    }

                </button>

            </div>


            {/* ================================================= */}
            {/* VERSION HISTORY */}
            {/* ================================================= */}

            <div className="version-history">

                <div className="history-title">

                    <h3>
                        Version History
                    </h3>

                    <button
                        type="button"
                        onClick={loadVersions}
                        disabled={loading}
                        className="refresh-btn"
                    >

                        {loading
                            ? "Loading..."
                            : "↻ Refresh"
                        }

                    </button>

                </div>


                {loading ? (

                    <div className="version-loading">

                        Loading version history...

                    </div>

                ) : versions.length === 0 ? (

                    <div className="no-versions">

                        No versions found.

                    </div>

                ) : (

                    <div className="versions-list">

                        {versions.map(
                            (version) => (

                                <div
                                    className={
                                        `version-card ${
                                            version.isCurrent
                                                ? "current"
                                                : ""
                                        }`
                                    }
                                    key={
                                        version.id
                                    }
                                >

                                    {/* VERSION NUMBER */}

                                    <div className="version-number">

                                        <span>
                                            v
                                        </span>

                                        <strong>
                                            {
                                                version.version
                                            }
                                        </strong>

                                    </div>


                                    {/* VERSION DETAILS */}

                                    <div className="version-details">

                                        <div className="version-name">

                                            {
                                                version.originalName
                                            }

                                        </div>


                                        <div className="version-meta">

                                            <span>
                                                📦 {
                                                    formatSize(
                                                        version.size
                                                    )
                                                }
                                            </span>

                                            <span>
                                                📅 {
                                                    formatDate(
                                                        version.uploadedAt
                                                    )
                                                }
                                            </span>

                                        </div>


                                        {version.uploadedBy && (

                                            <div className="uploaded-by">

                                                Uploaded by:{" "}

                                                {
                                                    version.uploadedBy.name ||
                                                    version.uploadedBy.email ||
                                                    "User"
                                                }

                                            </div>
                                        )}

                                    </div>


                                    {/* CURRENT */}

                                    <div className="version-status">

                                        {version.isCurrent && (

                                            <span className="current-badge">

                                                CURRENT

                                            </span>
                                        )}

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="version-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDownload(
                                                    version
                                                )
                                            }
                                        >

                                            ⬇️ Download

                                        </button>


                                        {!version.isCurrent && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRestore(
                                                        version
                                                    )
                                                }
                                                disabled={
                                                    restoring ===
                                                    version.version ||
                                                    file?.isLocked
                                                }
                                            >

                                                {restoring ===
                                                version.version

                                                    ? "Restoring..."

                                                    : "↩ Restore"
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

        </div>
    );
};


export default FileVersioning;