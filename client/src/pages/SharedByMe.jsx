
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./SharedByMe.css";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const getToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    "";

const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
};

const Icon = ({ name, size = 18 }) => {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    const paths = {
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        refresh: (
            <>
                <path d="M20 11a8 8 0 0 0-15.4-2.8" />
                <path d="M4 5v4h4" />
                <path d="M4 13a8 8 0 0 0 15.4 2.8" />
                <path d="M20 19v-4h-4" />
            </>
        ),
        file: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h5" />
            </>
        ),
        download: (
            <>
                <path d="M12 3v11" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
            </>
        ),
        trash: (
            <>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
            </>
        ),
        share: (
            <>
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.8 7.5-4.4" />
                <path d="m8.2 13.2 7.5 4.4" />
            </>
        ),
        eye: (
            <>
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
        close: (
            <>
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        alert: (
            <>
                <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </>
        ),
    };

    return <svg {...common}>{paths[name] || null}</svg>;
};

const formatSize = (bytes) => {
    const size = Number(bytes);

    if (!Number.isFinite(size) || size <= 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
        Math.floor(Math.log(size) / Math.log(1024)),
        units.length - 1
    );

    return `${(size / Math.pow(1024, index)).toFixed(
        index === 0 ? 0 : 1
    )} ${units[index]}`;
};

const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getFileType = (file = {}) => {
    const mime = file.mimeType || "";
    const name = (file.originalName || file.originalname || "").toLowerCase();

    if (mime === "application/pdf" || name.endsWith(".pdf")) return "PDF";
    if (mime.startsWith("image/")) return "IMAGE";

    if (
        mime.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) return "WORD";

    if (
        mime.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx")
    ) return "EXCEL";

    if (mime === "text/plain" || name.endsWith(".txt")) return "TEXT";

    return "FILE";
};

export default function SharedByMe() {
    const navigate = useNavigate();

    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [user, setUser] = useState({
        name: "User",
        email: "",
    });

    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [selectedPermission, setSelectedPermission] = useState("read");
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        try {
            const storedUser =
                localStorage.getItem("user") ||
                localStorage.getItem("currentUser");

            if (storedUser) {
                const parsed = JSON.parse(storedUser);

                setUser({
                    name: parsed.name || parsed.username || parsed.firstName || "User",
                    email: parsed.email || "",
                });
            }
        } catch (err) {
            console.error("Unable to read user:", err);
        }
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ message, type });

        window.setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    const fetchShares = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/shares/by-me");

            setShares(Array.isArray(data.shares) ? data.shares : []);
        } catch (err) {
            console.error("Fetch shared by me error:", err);

            setError(
                err.message || "Unable to load files shared by you."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShares();
    }, []);

    const filteredShares = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return shares;

        return shares.filter((share) => {
            const fileName =
                share.file?.originalName ||
                share.file?.originalname ||
                "";

            const email = share.sharedWith?.email || "";
            const name = share.sharedWith?.name || "";

            return (
                fileName.toLowerCase().includes(query) ||
                email.toLowerCase().includes(query) ||
                name.toLowerCase().includes(query)
            );
        });
    }, [shares, search]);

    const readOnlyCount = shares.filter(
        (share) => share.permission === "read"
    ).length;

    const writeCount = shares.filter(
        (share) => share.permission === "write"
    ).length;

    const handleDownload = async (share) => {
        const fileId = share.file?._id || share.file?.id;

        if (!fileId) {
            showToast("File information is missing.", "error");
            return;
        }

        try {
            setActionLoading(`download-${share._id}`);

            const token = getToken();

            if (!token) {
                throw new Error(
                    "You are not authenticated. Please login again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/files/${fileId}/download`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                let message = "Download failed.";

                try {
                    const errorData = await response.json();
                    message =
                        errorData.message ||
                        errorData.error ||
                        message;
                } catch {
                    // Response wasn't JSON.
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            if (!blob || blob.size === 0) {
                throw new Error("The downloaded file is empty.");
            }

            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download =
                share.file?.originalName ||
                share.file?.originalname ||
                "download";
            anchor.style.display = "none";

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            window.setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);

            showToast("File downloaded successfully.");
        } catch (err) {
            console.error("Download error:", err);

            showToast(err.message || "Download failed.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const openPermissionModal = (share) => {
        setSelectedPermission(share.permission || "read");
        setModal({ type: "permission", share });
    };

    const handlePermissionChange = async () => {
        const share = modal?.share;

        if (!share) return;

        try {
            setActionLoading(`permission-${share._id}`);

            const data = await apiRequest(`/shares/${share._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    permission: selectedPermission,
                }),
            });

            setShares((previous) =>
                previous.map((item) =>
                    item._id === share._id
                        ? { ...item, permission: selectedPermission }
                        : item
                )
            );

            setModal(null);

            showToast(
                data.message || "Permission updated successfully."
            );
        } catch (err) {
            console.error("Permission update error:", err);

            showToast(
                err.message || "Unable to update permission.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const openRevokeModal = (share) => {
        setModal({ type: "revoke", share });
    };

    const handleRevoke = async () => {
        const share = modal?.share;

        if (!share) return;

        try {
            setActionLoading(`revoke-${share._id}`);

            const data = await apiRequest(`/shares/${share._id}`, {
                method: "DELETE",
            });

            setShares((previous) =>
                previous.filter((item) => item._id !== share._id)
            );

            setModal(null);

            showToast(
                data.message || "File sharing revoked successfully."
            );
        } catch (err) {
            console.error("Revoke error:", err);

            showToast(
                err.message || "Unable to revoke sharing.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        localStorage.removeItem("currentUser");

        navigate("/login");
    };

    const avatarLetter = (user.name || "U").charAt(0).toUpperCase();

    const modalShareId = modal?.share?._id;
    const permissionBusy = actionLoading === `permission-${modalShareId}`;
    const revokeBusy = actionLoading === `revoke-${modalShareId}`;

    const navTo = (path) => navigate(path);

    return (
        <div className="dashboard-page shared-by-me-page">
            <header className="dashboard-navbar">
                <div className="navbar-left">
                    <button
                        className="brand-button"
                        onClick={() => navTo("/dashboard")}
                        type="button"
                    >
                        <span className="brand-mark">F</span>
                        <span className="brand-name">FileNest</span>
                    </button>

                    <nav className="main-navigation">
                        <button
                            className="nav-link"
                            type="button"
                            onClick={() => navTo("/dashboard")}
                        >
                            Overview
                        </button>

                        <button
                            className="nav-link"
                            type="button"
                            onClick={() => navTo("/my-files")}
                        >
                            My Files
                        </button>

                        <button
                            className="nav-link"
                            type="button"
                            onClick={() => navTo("/shared-with-me")}
                        >
                            Shared with me
                        </button>

                        <button
                            className="nav-link active"
                            type="button"
                            onClick={() => navTo("/shared-by-me")}
                            aria-current="page"
                        >
                            Shared by me
                        </button>
                    </nav>
                </div>

                <div className="navbar-right">
                    <div className="user-avatar" title={user.name}>
                        {avatarLetter}
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                        type="button"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-intro shared-intro">
                    <div>
                        <h1>Shared By Me</h1>
                        <p>
                            Manage files you have shared with other users.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="shared-refresh-button"
                        onClick={fetchShares}
                        disabled={loading}
                    >
                        <Icon name="refresh" size={15} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </section>

                {error && (
                    <div className="dashboard-error">
                        <span>{error}</span>
                        <button type="button" onClick={fetchShares}>
                            Try again
                        </button>
                    </div>
                )}

                <section className="shared-overview">
                    <article className="shared-stat-card">
                        <div>
                            <div className="shared-stat-label">
                                Shared files
                            </div>
                            <div className="shared-stat-value">
                                {shares.length}
                            </div>
                            <div className="shared-stat-description">
                                Active file shares
                            </div>
                        </div>
                        <div className="shared-stat-icon blue">
                            <Icon name="share" size={19} />
                        </div>
                    </article>

                    <article className="shared-stat-card">
                        <div>
                            <div className="shared-stat-label">
                                Read only
                            </div>
                            <div className="shared-stat-value">
                                {readOnlyCount}
                            </div>
                            <div className="shared-stat-description">
                                Users with read access
                            </div>
                        </div>
                        <div className="shared-stat-icon green">
                            <Icon name="eye" size={19} />
                        </div>
                    </article>

                    <article className="shared-stat-card">
                        <div>
                            <div className="shared-stat-label">
                                Read &amp; write
                            </div>
                            <div className="shared-stat-value">
                                {writeCount}
                            </div>
                            <div className="shared-stat-description">
                                Users with write access
                            </div>
                        </div>
                        <div className="shared-stat-icon amber">
                            <Icon name="edit" size={19} />
                        </div>
                    </article>
                </section>

                <section className="shared-files-section">
                    <div className="section-heading">
                        <div>
                            <h2>Files shared by you</h2>
                            <p>
                                {filteredShares.length === 1
                                    ? "1 active share"
                                    : `${filteredShares.length} active shares`}
                            </p>
                        </div>

                        <div className="recent-files-actions">
                            <div className="recent-search shared-search">
                                <Icon name="search" size={17} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search by file or user..."
                                    aria-label="Search shared files"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="files-table-card shared-table-card">
                        {loading ? (
                            <div className="files-loading">
                                <div className="loading-spinner" />
                                <span>Loading shared files...</span>
                            </div>
                        ) : filteredShares.length === 0 ? (
                            <div className="empty-files">
                                <div className="empty-file-icon">
                                    <Icon name="share" size={23} />
                                </div>

                                <h3>No shared files</h3>

                                <p>
                                    {search
                                        ? "No shared files match your search."
                                        : "Files you share with other users will appear here."}
                                </p>
                            </div>
                        ) : (
                            <div className="shared-table-scroll">
                                <div className="shared-table">
                                    <div className="shared-table-header">
                                        <span>FILE</span>
                                        <span>SHARED WITH</span>
                                        <span>PERMISSION</span>
                                        <span>SHARED DATE</span>
                                        <span>ACTIONS</span>
                                    </div>

                                    {filteredShares.map((share) => {
                                        const file = share.file || {};
                                        const recipient = share.sharedWith || {};
                                        const shareId = share._id;

                                        const downloadBusy =
                                            actionLoading === `download-${shareId}`;
                                        const permissionBusyRow =
                                            actionLoading === `permission-${shareId}`;
                                        const revokeBusyRow =
                                            actionLoading === `revoke-${shareId}`;

                                        const recipientName =
                                            recipient.name ||
                                            recipient.email ||
                                            "U";

                                        return (
                                            <div
                                                className="shared-table-row"
                                                key={shareId}
                                            >
                                                <div className="shared-file-cell">
                                                    <div className="file-icon">
                                                        <Icon name="file" size={19} />
                                                    </div>

                                                    <div className="file-name-wrapper">
                                                        <div
                                                            className="shared-file-name"
                                                            title={
                                                                file.originalName ||
                                                                file.originalname ||
                                                                "Unknown file"
                                                            }
                                                        >
                                                            {file.originalName ||
                                                                file.originalname ||
                                                                "Unknown file"}
                                                        </div>

                                                        <span className="file-description">
                                                            {getFileType(file)}{" "}
                                                            <span className="shared-meta-dot">
                                                                ·
                                                            </span>{" "}
                                                            {formatSize(file.size)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shared-recipient-cell">
                                                    <div className="shared-recipient-avatar">
                                                        {recipientName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="shared-recipient-details">
                                                        <strong>
                                                            {recipient.name ||
                                                                "Unknown user"}
                                                        </strong>
                                                        <span>
                                                            {recipient.email ||
                                                                "No email"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shared-permission-cell">
                                                    <span
                                                        className={
                                                            share.permission === "write"
                                                                ? "shared-permission-badge write"
                                                                : "shared-permission-badge read"
                                                        }
                                                    >
                                                        <span className="shared-permission-dot" />
                                                        {share.permission === "write"
                                                            ? "Read & Write"
                                                            : "Read only"}
                                                    </span>
                                                </div>

                                                <div className="shared-date-cell">
                                                    {formatDate(share.createdAt)}
                                                </div>

                                                <div className="shared-actions-cell">
                                                    <button
                                                        type="button"
                                                        className="shared-action-button"
                                                        onClick={() =>
                                                            handleDownload(share)
                                                        }
                                                        disabled={
                                                            downloadBusy ||
                                                            permissionBusyRow ||
                                                            revokeBusyRow
                                                        }
                                                        title="Download file"
                                                    >
                                                        <Icon name="download" size={14} />
                                                        {downloadBusy
                                                            ? "..."
                                                            : "Download"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="shared-action-button"
                                                        onClick={() =>
                                                            openPermissionModal(share)
                                                        }
                                                        disabled={
                                                            permissionBusyRow ||
                                                            revokeBusyRow
                                                        }
                                                        title="Change permission"
                                                    >
                                                        <Icon name="edit" size={14} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="shared-action-button danger"
                                                        onClick={() =>
                                                            openRevokeModal(share)
                                                        }
                                                        disabled={
                                                            permissionBusyRow ||
                                                            revokeBusyRow
                                                        }
                                                        title="Revoke access"
                                                    >
                                                        <Icon name="trash" size={14} />
                                                        Revoke
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer className="dashboard-footer">
                <div className="footer-brand">
                    <span className="footer-mark">F</span>
                    <span>FileNest</span>
                </div>
                <span className="footer-text">
                    Secure file management
                </span>
            </footer>

            {modal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            if (!permissionBusy && !revokeBusy) {
                                setModal(null);
                            }
                        }
                    }}
                >
                    <div
                        className="upload-modal shared-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="shared-modal-title"
                    >
                        {modal.type === "permission" && (
                            <>
                                <div className="modal-header">
                                    <div>
                                        <h2 id="shared-modal-title">
                                            Change permission
                                        </h2>
                                        <p className="shared-modal-file">
                                            {modal.share?.file?.originalName ||
                                                modal.share?.file?.originalname ||
                                                "Unknown file"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="modal-close"
                                        onClick={() => setModal(null)}
                                        disabled={permissionBusy}
                                        aria-label="Close dialog"
                                    >
                                        <Icon name="close" size={17} />
                                    </button>
                                </div>

                                <div className="shared-modal-body">
                                    <p>
                                        Change what this user can do with
                                        the shared file.
                                    </p>

                                    <label className="shared-field-label">
                                        Shared with
                                    </label>
                                    <input
                                        className="shared-modal-input"
                                        value={
                                            modal.share?.sharedWith?.email || ""
                                        }
                                        disabled
                                    />

                                    <label className="shared-field-label">
                                        Permission
                                    </label>
                                    <select
                                        className="shared-modal-input"
                                        value={selectedPermission}
                                        onChange={(event) =>
                                            setSelectedPermission(
                                                event.target.value
                                            )
                                        }
                                        disabled={permissionBusy}
                                    >
                                        <option value="read">Read only</option>
                                        <option value="write">
                                            Read &amp; Write
                                        </option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setModal(null)}
                                        disabled={permissionBusy}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="confirm-upload-button"
                                        onClick={handlePermissionChange}
                                        disabled={permissionBusy}
                                    >
                                        {permissionBusy
                                            ? "Updating..."
                                            : "Update permission"}
                                    </button>
                                </div>
                            </>
                        )}

                        {modal.type === "revoke" && (
                            <>
                                <div className="modal-header">
                                    <div>
                                        <h2 id="shared-modal-title">
                                            Revoke access
                                        </h2>
                                        <p className="shared-modal-file">
                                            {modal.share?.file?.originalName ||
                                                modal.share?.file?.originalname ||
                                                "Unknown file"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="modal-close"
                                        onClick={() => setModal(null)}
                                        disabled={revokeBusy}
                                        aria-label="Close dialog"
                                    >
                                        <Icon name="close" size={17} />
                                    </button>
                                </div>

                                <div className="shared-modal-body">
                                    <div className="shared-revoke-warning">
                                        <Icon name="alert" size={19} />
                                    </div>

                                    <p>
                                        Are you sure you want to revoke access
                                        for{" "}
                                        <strong>
                                            {modal.share?.sharedWith?.email ||
                                                "this user"}
                                        </strong>
                                        ? They will no longer be able to access
                                        this shared file.
                                    </p>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setModal(null)}
                                        disabled={revokeBusy}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="shared-revoke-confirm"
                                        onClick={handleRevoke}
                                        disabled={revokeBusy}
                                    >
                                        {revokeBusy
                                            ? "Revoking..."
                                            : "Revoke access"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div
                    className={`shared-toast ${
                        toast.type === "error" ? "error" : ""
                    }`}
                    role="status"
                >
                    <span className="shared-toast-icon">
                        <Icon
                            name={toast.type === "error" ? "alert" : "check"}
                            size={14}
                        />
                    </span>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}