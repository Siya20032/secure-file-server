import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
)
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

function Dashboard() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState("");

    const [userName, setUserName] = useState("Siya");

    // =========================================================
    // ACTIVITY STATE
    // =========================================================

    const [activities, setActivities] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState("");

    // =========================================================
    // GET TOKEN
    // =========================================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("jwt")
        );
    };

    // =========================================================
    // API REQUEST
    // =========================================================

    const apiRequest = async (endpoint, options = {}) => {
        const token = getToken();

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,

            headers: {
                ...(options.body instanceof FormData
                    ? {}
                    : {
                          "Content-Type": "application/json",
                      }),

                ...(token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {}),

                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            let message = `Request failed with status ${response.status}`;

            try {
                const data = await response.json();

                message =
                    data?.message ||
                    data?.error ||
                    message;
            } catch {
                // Ignore JSON parsing error
            }

            throw new Error(message);
        }

        const contentType =
            response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            return response.json();
        }

        return response;
    };

    // =========================================================
    // GET USER NAME
    // =========================================================

    useEffect(() => {
        try {
            const storedUser =
                localStorage.getItem("user") ||
                localStorage.getItem("currentUser");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);

                const name =
                    parsedUser?.name ||
                    parsedUser?.username ||
                    parsedUser?.firstName;

                if (name) {
                    setUserName(name);
                }
            }
        } catch {
            // Keep default name
        }
    }, []);

    // =========================================================
    // FETCH FILES
    // =========================================================

    const fetchFiles = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/api/files");

            const fileList = Array.isArray(data)
                ? data
                : data?.files ||
                  data?.data ||
                  data?.results ||
                  [];

            setFiles(fileList);
        } catch (err) {
            console.error("Fetch files error:", err);

            setError(
                err.message ||
                    "Unable to load your files."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH REAL ACTIVITY
    // =========================================================

    const fetchActivities = async () => {
        try {
            setActivityLoading(true);
            setActivityError("");

            const data = await apiRequest(
                "/api/activity/my"
            );

            const activityList = Array.isArray(data)
                ? data
                : data?.logs ||
                  data?.activities ||
                  data?.data ||
                  [];

            setActivities(activityList);
        } catch (err) {
            console.error(
                "Fetch activity error:",
                err
            );

            setActivityError(
                err.message ||
                    "Unable to load recent activity."
            );

            setActivities([]);
        } finally {
            setActivityLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        fetchActivities();
    }, []);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const navigateTo = (page) => {
        if (page === "overview") {
            window.location.href = "/dashboard";
        }

        if (page === "my-files") {
            window.location.href = "/my-files";
        }

        if (page === "shared-with-me") {
            window.location.href = "/shared-with-me";
        }

        if (page === "shared-by-me") {
            window.location.href = "/shared-by-me";
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        localStorage.removeItem("currentUser");

        window.location.href = "/login";
    };

    // =========================================================
    // FORMAT FILE SIZE
    // =========================================================

    const formatFileSize = (bytes) => {
        if (
            bytes === null ||
            bytes === undefined ||
            isNaN(Number(bytes))
        ) {
            return "—";
        }

        const size = Number(bytes);

        if (size === 0) {
            return "0 B";
        }

        const units = [
            "B",
            "KB",
            "MB",
            "GB",
            "TB",
        ];

        const index = Math.floor(
            Math.log(size) / Math.log(1024)
        );

        return `${(
            size / Math.pow(1024, index)
        ).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
    };

    // =========================================================
    // GET FILE NAME
    // =========================================================

    const getFileName = (file) => {
        return (
            file?.originalName ||
            file?.originalname ||
            file?.filename ||
            file?.name ||
            "Unnamed file"
        );
    };

    // =========================================================
    // GET FILE EXTENSION
    // =========================================================

    const getFileExtension = (file) => {
        const name = getFileName(file);

        const parts = name.split(".");

        if (parts.length > 1) {
            return parts.pop().toUpperCase();
        }

        return "FILE";
    };

    // =========================================================
    // GET FILE SIZE
    // =========================================================

    const getFileSize = (file) => {
        return (
            file?.size ||
            file?.fileSize ||
            file?.filesize ||
            file?.metadata?.size ||
            0
        );
    };

    // =========================================================
    // GET MODIFIED DATE
    // =========================================================

    const getModifiedDate = (file) => {
        return (
            file?.updatedAt ||
            file?.updated_at ||
            file?.modifiedAt ||
            file?.modified_at ||
            file?.createdAt ||
            file?.created_at
        );
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "—";
        }

        const now = new Date();

        const difference =
            now.getTime() - date.getTime();

        const day =
            1000 * 60 * 60 * 24;

        if (difference < day) {
            return "Today";
        }

        if (difference < day * 2) {
            return "Yesterday";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    // =========================================================
    // ACTIVITY FILE NAME
    // =========================================================

    const getActivityFileName = (activity) => {
        const file = activity?.file;

        if (typeof file === "string") {
            return file;
        }

        return (
            file?.originalName ||
            file?.originalname ||
            file?.filename ||
            file?.name ||
            activity?.fileName ||
            activity?.filename ||
            "Unknown file"
        );
    };

    // =========================================================
    // ACTIVITY DATE
    // =========================================================

    const getActivityDate = (activity) => {
        return (
            activity?.createdAt ||
            activity?.created_at ||
            activity?.timestamp ||
            activity?.date ||
            activity?.updatedAt ||
            activity?.updated_at
        );
    };

    // =========================================================
    // ACTIVITY TEXT
    // =========================================================

    const getActivityText = (action) => {
        const actionLabels = {
            UPLOAD: "uploaded",
            DOWNLOAD: "downloaded",
            SHARE: "shared",
            CHANGE_PERMISSION: "changed permissions for",
            LOCK: "locked",
            UNLOCK: "unlocked",
            DELETE: "deleted",
            RENAME: "renamed",
            UPDATE: "updated",
            CREATE: "created",
        };

        if (actionLabels[action]) {
            return actionLabels[action];
        }

        if (action) {
            return action
                .toLowerCase()
                .replace(/_/g, " ");
        }

        return "performed an action on";
    };

    // =========================================================
    // ACTIVITY ICON
    // =========================================================

    const getActivityIcon = (action) => {
        switch (action) {
            case "UPLOAD":
                return "↑";

            case "DOWNLOAD":
                return "↓";

            case "SHARE":
                return "↗";

            case "CHANGE_PERMISSION":
                return "⚙";

            case "DELETE":
                return "×";

            default:
                return "•";
        }
    };

    // =========================================================
    // RECENT FILES
    // =========================================================

    const recentFiles = useMemo(() => {
        const sortedFiles = [...files].sort(
            (a, b) => {
                const dateA = new Date(
                    getModifiedDate(a) || 0
                ).getTime();

                const dateB = new Date(
                    getModifiedDate(b) || 0
                ).getTime();

                return dateB - dateA;
            }
        );

        const searchValue =
            search.trim().toLowerCase();

        if (!searchValue) {
            return sortedFiles.slice(0, 5);
        }

        return sortedFiles
            .filter((file) =>
                getFileName(file)
                    .toLowerCase()
                    .includes(searchValue)
            )
            .slice(0, 5);
    }, [files, search]);

    // =========================================================
    // RECENT ACTIVITY
    // =========================================================

    const recentActivity = useMemo(() => {
        const sortedActivities = [...activities].sort(
            (a, b) => {
                const dateA = new Date(
                    getActivityDate(a) || 0
                ).getTime();

                const dateB = new Date(
                    getActivityDate(b) || 0
                ).getTime();

                return dateB - dateA;
            }
        );

        return sortedActivities
            .slice(0, 3)
            .map((activity) => ({
                id: activity?._id,

                action: activity?.action,

                actionText: getActivityText(
                    activity?.action
                ),

                icon: getActivityIcon(
                    activity?.action
                ),

                fileName:
                    getActivityFileName(
                        activity
                    ),

                date: formatDate(
                    getActivityDate(activity)
                ),
            }));
    }, [activities]);

    // =========================================================
    // REAL STORAGE CALCULATION
    // =========================================================

    const storageUsed = useMemo(() => {
        return files.reduce(
            (total, file) => {
                return (
                    total +
                    Number(
                        getFileSize(file) || 0
                    )
                );
            },
            0
        );
    }, [files]);

    // 5 GB storage limit

    const storageLimit =
        5 * 1024 * 1024 * 1024;

    // Calculate percentage

    const storagePercentage =
        storageLimit > 0
            ? Math.min(
                  (storageUsed /
                      storageLimit) *
                      100,
                  100
              )
            : 0;

    // Remaining storage

    const storageRemaining = Math.max(
        storageLimit - storageUsed,
        0
    );

    // =========================================================
    // DOWNLOAD FILE
    // =========================================================

    const handleDownload = async (file) => {
        try {
            const id =
                file?._id ||
                file?.id;

            if (!id) {
                return;
            }

            const token = getToken();

            const response = await fetch(
                `${API_URL}/api/files/${id}/download`,
                {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to download file."
                );
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(blob);

            const anchor =
                document.createElement("a");

            anchor.href = url;

            anchor.download =
                getFileName(file);

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);

            // Refresh activity
            await fetchActivities();
        } catch (err) {
            console.error(
                "Download error:",
                err
            );
        }
    };

    // =========================================================
    // OPEN UPLOAD MODAL
    // =========================================================

    const openUploadModal = () => {
        setSelectedFile(null);
        setUploadError("");
        setUploadSuccess("");
        setUploadModalOpen(true);
    };

    // =========================================================
    // CLOSE UPLOAD MODAL
    // =========================================================

    const closeUploadModal = () => {
        if (uploading) {
            return;
        }

        setUploadModalOpen(false);
        setSelectedFile(null);
        setUploadError("");
        setUploadSuccess("");
    };

    // =========================================================
    // SELECT FILE
    // =========================================================

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        setUploadError("");
        setUploadSuccess("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    // =========================================================
    // UPLOAD FILE
    // =========================================================

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError(
                "Please select a file first."
            );

            return;
        }

        try {
            setUploading(true);

            setUploadError("");

            setUploadSuccess("");

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const token = getToken();

            const response = await fetch(
                `${API_URL}/api/files/upload`,
                {
                    method: "POST",

                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},

                    body: formData,
                }
            );

            if (!response.ok) {
                let message =
                    "Upload failed.";

                try {
                    const data =
                        await response.json();

                    message =
                        data?.message ||
                        data?.error ||
                        message;
                } catch {
                    // Ignore JSON parse error
                }

                throw new Error(message);
            }

            setUploadSuccess(
                "File uploaded successfully."
            );

            setSelectedFile(null);

            // Refresh files.
            // This automatically recalculates storage.
            await fetchFiles();

            // Refresh activity.
            await fetchActivities();

            setTimeout(() => {
                setUploadModalOpen(false);

                setUploadSuccess("");
            }, 1000);
        } catch (err) {
            console.error(
                "Upload error:",
                err
            );

            setUploadError(
                err.message ||
                    "Unable to upload file."
            );
        } finally {
            setUploading(false);
        }
    };

    // =========================================================
    // GREETING
    // =========================================================

    const getGreeting = () => {
        const hour =
            new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 17) {
            return "Good afternoon";
        }

        return "Good evening";
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="dashboard-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="dashboard-navbar">
                <div className="navbar-left">

                    <button
                        className="brand-button"
                        onClick={() =>
                            navigateTo("overview")
                        }
                    >
                        <span className="brand-mark">
                            F
                        </span>

                        <span className="brand-name">
                            FileNest
                        </span>
                    </button>

                    <nav className="main-navigation">

                        <button
                            className="nav-link active"
                            onClick={() =>
                                navigateTo("overview")
                            }
                        >
                            Overview
                        </button>

                        <button
                            className="nav-link"
                            onClick={() =>
                                navigateTo("my-files")
                            }
                        >
                            My Files
                        </button>

                        <button
                            className="nav-link"
                            onClick={() =>
                                navigateTo(
                                    "shared-with-me"
                                )
                            }
                        >
                            Shared with me
                        </button>

                        <button
                            className="nav-link"
                            onClick={() =>
                                navigateTo(
                                    "shared-by-me"
                                )
                            }
                        >
                            Shared by me
                        </button>

                    </nav>
                </div>

                <div className="navbar-right">

                    <div className="user-avatar">
                        {userName
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>
            </header>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="dashboard-content">

                {/* INTRO */}

                <section className="dashboard-intro">
                    <div>

                        <h1>
                            {getGreeting()},{" "}
                            {userName}
                        </h1>

                        <p>
                            Here's what's
                            happening in your
                            workspace.
                        </p>

                    </div>
                </section>

                {/* ERROR */}

                {error && (
                    <div className="dashboard-error">

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={fetchFiles}
                        >
                            Try again
                        </button>

                    </div>
                )}

                {/* =================================================
                    RECENT FILES
                ================================================= */}

                <section className="recent-files-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Recent Files
                            </h2>

                            <p>
                                Your most recently
                                updated files
                            </p>

                        </div>

                        <div className="recent-files-actions">

                            <div className="recent-search">

                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="6.5"
                                    />

                                    <path d="M16 16L21 21" />
                                </svg>

                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={search}
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                            </div>

                            <button
                                className="upload-button"
                                onClick={
                                    openUploadModal
                                }
                            >
                                <span className="upload-icon">
                                    +
                                </span>

                                Upload file
                            </button>

                        </div>
                    </div>

                    <div className="files-table-card">

                        {loading ? (

                            <div className="files-loading">

                                <div className="loading-spinner"></div>

                                <span>
                                    Loading files...
                                </span>

                            </div>

                        ) : recentFiles.length === 0 ? (

                            <div className="empty-files">

                                <div className="empty-file-icon">

                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

                                        <path d="M14 2v6h6" />

                                        <path d="M8 13h8" />

                                        <path d="M8 17h5" />
                                    </svg>

                                </div>

                                <h3>
                                    {search
                                        ? "No files found"
                                        : "No files yet"}
                                </h3>

                                <p>
                                    {search
                                        ? "Try a different file name."
                                        : "Upload your first file to get started."}
                                </p>

                                {!search && (
                                    <button
                                        className="empty-upload-button"
                                        onClick={
                                            openUploadModal
                                        }
                                    >
                                        Upload file
                                    </button>
                                )}

                            </div>

                        ) : (

                            <div className="files-table">

                                <div className="table-header">

                                    <span className="file-column">
                                        FILE
                                    </span>

                                    <span>
                                        TYPE
                                    </span>

                                    <span>
                                        SIZE
                                    </span>

                                    <span>
                                        MODIFIED
                                    </span>

                                </div>

                                {recentFiles.map(
                                    (
                                        file,
                                        index
                                    ) => {

                                        const fileName =
                                            getFileName(
                                                file
                                            );

                                        const extension =
                                            getFileExtension(
                                                file
                                            );

                                        const size =
                                            getFileSize(
                                                file
                                            );

                                        return (
                                            <div
                                                className="file-row"
                                                key={
                                                    file?._id ||
                                                    file?.id ||
                                                    index
                                                }
                                            >

                                                <div className="file-info">

                                                    <div className="file-icon">

                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />

                                                            <path d="M14 2v6h6" />

                                                            <path d="M8 13h8" />

                                                            <path d="M8 17h5" />
                                                        </svg>

                                                    </div>

                                                    <div className="file-name-wrapper">

                                                        <button
                                                            className="file-name"
                                                            onClick={() =>
                                                                handleDownload(
                                                                    file
                                                                )
                                                            }
                                                            title="Download file"
                                                        >
                                                            {fileName}
                                                        </button>

                                                        <span className="file-description">
                                                            Personal
                                                            document
                                                        </span>

                                                    </div>

                                                </div>

                                                <span className="file-type">
                                                    {extension}
                                                </span>

                                                <span className="file-size">
                                                    {formatFileSize(
                                                        size
                                                    )}
                                                </span>

                                                <span className="file-modified">
                                                    {formatDate(
                                                        getModifiedDate(
                                                            file
                                                        )
                                                    )}
                                                </span>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </div>
                </section>

                {/* =================================================
                    BOTTOM SECTION
                ================================================= */}

                <section className="dashboard-bottom">

                    {/* =================================================
                        ACTIVITY
                    ================================================= */}

                    <div className="activity-card">

                        <div className="card-heading">

                            <div>

                                <h2>
                                    Recent Activity
                                </h2>

                                <p>
                                    Latest file
                                    activity
                                </p>

                            </div>

                        </div>

                        <div className="activity-list">

                            {activityLoading ? (

                                <div className="activity-empty">
                                    Loading activity...
                                </div>

                            ) : activityError ? (

                                <div className="activity-empty">
                                    {activityError}
                                </div>

                            ) : recentActivity.length === 0 ? (

                                <div className="activity-empty">
                                    No recent activity.
                                </div>

                            ) : (

                                recentActivity.map(
                                    (
                                        activity,
                                        index
                                    ) => (

                                        <div
                                            className="activity-item"
                                            key={
                                                activity.id ||
                                                index
                                            }
                                        >

                                            <div className="activity-icon">
                                                {
                                                    activity.icon
                                                }
                                            </div>

                                            <div className="activity-details">

                                                <span>
                                                    You{" "}
                                                    {
                                                        activity.actionText
                                                    }{" "}
                                                    <strong>
                                                        {
                                                            activity.fileName
                                                        }
                                                    </strong>
                                                </span>

                                                <small>
                                                    {
                                                        activity.date
                                                    }
                                                </small>

                                            </div>

                                        </div>
                                    )
                                )
                            )}

                        </div>
                    </div>

                    {/* =================================================
                        STORAGE CARD
                    ================================================= */}

                    <div className="storage-card">

                        <div className="card-heading">

                            <div>

                                <h2>
                                    Storage
                                </h2>

                                <p>
                                    Your current
                                    storage usage
                                </p>

                            </div>

                        </div>

                        {/* USED STORAGE */}

                        <div className="storage-value">

                            <strong>
                                {formatFileSize(
                                    storageUsed
                                )}
                            </strong>

                            <span>
                                of{" "}
                                {formatFileSize(
                                    storageLimit
                                )}
                            </span>

                        </div>

                        {/* PROGRESS BAR */}

                        <div className="storage-progress">

                            <div
                                className="storage-progress-fill"
                                style={{
                                    width: `${Math.max(
                                        storagePercentage,
                                        storageUsed >
                                            0
                                            ? 1
                                            : 0
                                    )}%`,
                                }}
                            ></div>

                        </div>

                        {/* STORAGE FOOTER */}

                        <div className="storage-footer">

                            <span>
                                {storagePercentage.toFixed(
                                    1
                                )}
                                % used
                            </span>

                            <span>
                                {files.length}{" "}
                                {files.length === 1
                                    ? "file"
                                    : "files"}
                            </span>

                        </div>

                    </div>

                </section>
            </main>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="dashboard-footer">

                <div className="footer-brand">

                    <span className="footer-mark">
                        F
                    </span>

                    <span>
                        FileNest
                    </span>

                </div>

                <span className="footer-text">
                    Secure file management
                </span>

            </footer>

            {/* =================================================
                UPLOAD MODAL
            ================================================= */}

            {uploadModalOpen && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeUploadModal();
                        }

                    }}
                >

                    <div className="upload-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Upload file
                                </h2>

                                <p>
                                    Add a file to
                                    your FileNest
                                    workspace.
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeUploadModal
                                }
                                disabled={
                                    uploading
                                }
                            >
                                ×
                            </button>

                        </div>

                        <label
                            className={
                                selectedFile
                                    ? "file-drop-area selected"
                                    : "file-drop-area"
                            }
                        >

                            <input
                                type="file"
                                onChange={
                                    handleFileChange
                                }
                                disabled={
                                    uploading
                                }
                            />

                            <div className="drop-icon">

                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M12 16V4" />

                                    <path d="M7 9l5-5 5 5" />

                                    <path d="M5 20h14" />
                                </svg>

                            </div>

                            {selectedFile ? (

                                <>

                                    <strong>
                                        {
                                            selectedFile.name
                                        }
                                    </strong>

                                    <span>
                                        {formatFileSize(
                                            selectedFile.size
                                        )}
                                    </span>

                                </>

                            ) : (

                                <>

                                    <strong>
                                        Choose a file
                                    </strong>

                                    <span>
                                        Click here to
                                        browse your
                                        computer
                                    </span>

                                </>

                            )}

                        </label>

                        {uploadError && (

                            <div className="upload-error">
                                {uploadError}
                            </div>

                        )}

                        {uploadSuccess && (

                            <div className="upload-success">
                                {uploadSuccess}
                            </div>

                        )}

                        <div className="modal-actions">

                            <button
                                className="cancel-button"
                                onClick={
                                    closeUploadModal
                                }
                                disabled={
                                    uploading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-upload-button"
                                onClick={
                                    handleUpload
                                }
                                disabled={
                                    uploading ||
                                    !selectedFile
                                }
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload file"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Dashboard;