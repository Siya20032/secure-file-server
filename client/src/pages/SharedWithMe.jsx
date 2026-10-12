
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
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
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

    if (!Number.isFinite(size) || size <= 0) return "0 B";

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
    const name = (
        file.originalName ||
        file.originalname ||
        file.name ||
        ""
    ).toLowerCase();

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

const getFile = (share) =>
    share?.file || share?.sharedFile || share?.fileId || {};

const getOwner = (share) =>
    share?.sharedBy ||
    share?.owner ||
    share?.sender ||
    share?.user ||
    {};

const getFileId = (file) => {
    if (typeof file === "string") return file;
    return file?._id || file?.id || file?.fileId || "";
};

const getFileName = (file) =>
    file?.originalName ||
    file?.originalname ||
    file?.name ||
    "Unknown file";

const getPermissionLabel = (permission) =>
    permission === "write" ? "Read & Write" : "Read only";

const getShareDate = (share) =>
    share?.createdAt ||
    share?.sharedAt ||
    share?.updatedAt ||
    null;

const getShareList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.shares)) return data.shares;
    if (Array.isArray(data.sharedWithMe)) return data.sharedWithMe;
    if (Array.isArray(data.files)) return data.files;
    if (Array.isArray(data.data)) return data.data;
    return [];
};

export default function SharedWithMe() {
    const navigate = useNavigate();

    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);

    const [user, setUser] = useState({
        name: "User",
        email: "",
    });

    useEffect(() => {
        try {
            const storedUser =
                localStorage.getItem("user") ||
                localStorage.getItem("currentUser");

            if (storedUser) {
                const parsed = JSON.parse(storedUser);

                setUser({
                    name:
                        parsed.name ||
                        parsed.username ||
                        parsed.firstName ||
                        "User",
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

            const data = await apiRequest("/shares/with-me");
            setShares(getShareList(data));
        } catch (err) {
            console.error("Fetch shared with me error:", err);
            setError(err.message || "Unable to load files shared with you.");
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
            const file = getFile(share);
            const owner = getOwner(share);

            const fileName = getFileName(file).toLowerCase();
            const ownerName = (
                owner?.name ||
                owner?.username ||
                ""
            ).toLowerCase();
            const ownerEmail = (owner?.email || "").toLowerCase();

            return (
                fileName.includes(query) ||
                ownerName.includes(query) ||
                ownerEmail.includes(query)
            );
        });
    }, [shares, search]);

    const readOnlyCount = shares.filter(
        (share) => share.permission !== "write"
    ).length;

    const writeCount = shares.filter(
        (share) => share.permission === "write"
    ).length;

    const handleDownload = async (share) => {
        const file = getFile(share);
        const fileId = getFileId(file);

        if (!fileId) {
            showToast("File information is missing.", "error");
            return;
        }

        try {
            setActionLoading(`download-${share._id || fileId}`);

            const token = getToken();

            if (!token) {
                throw new Error("You are not authenticated. Please login again.");
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
                    // The response was not JSON.
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
            anchor.download = getFileName(file);
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

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        localStorage.removeItem("currentUser");

        navigate("/login");
    };

    const navTo = (path) => navigate(path);
    const avatarLetter = (user.name || "U").charAt(0).toUpperCase();

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
                            className="nav-link active"
                            type="button"
                            onClick={() => navTo("/shared-with-me")}
                            aria-current="page"
                        >
                            Shared with me
                        </button>

                        <button
                            className="nav-link"
                            type="button"
                            onClick={() => navTo("/shared-by-me")}
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
                        <h1>Shared With Me</h1>
                        <p>
                            Access and manage files that other users have
                            shared with you.
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
                                Files shared with you
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
                                Files with read access
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
                                Files with write access
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
                            <h2>Files shared with you</h2>
                            <p>
                                {filteredShares.length === 1
                                    ? "1 shared file"
                                    : `${filteredShares.length} shared files`}
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
                                    placeholder="Search by file or owner..."
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

                                <h3>
                                    {search
                                        ? "No matching files"
                                        : "No shared files yet"}
                                </h3>

                                <p>
                                    {search
                                        ? "No shared files match your search. Try another file name or owner."
                                        : "Files that other users share with you will appear here."}
                                </p>
                            </div>
                        ) : (
                            <div className="shared-table-scroll">
                                <div className="shared-table">
                                    <div className="shared-table-header">
                                        <span>FILE</span>
                                        <span>SHARED BY</span>
                                        <span>PERMISSION</span>
                                        <span>SHARED DATE</span>
                                        <span>ACTIONS</span>
                                    </div>

                                    {filteredShares.map((share, index) => {
                                        const file = getFile(share);
                                        const owner = getOwner(share);
                                        const shareId =
                                            share._id ||
                                            getFileId(file) ||
                                            index;

                                        const ownerName =
                                            owner?.name ||
                                            owner?.username ||
                                            owner?.email ||
                                            "Unknown user";

                                        const permission =
                                            share.permission === "write"
                                                ? "write"
                                                : "read";

                                        const downloadBusy =
                                            actionLoading ===
                                            `download-${share._id || getFileId(file)}`;

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
                                                            title={getFileName(file)}
                                                        >
                                                            {getFileName(file)}
                                                        </div>

                                                        <span className="file-description">
                                                            {getFileType(file)}
                                                            <span className="shared-meta-dot">
                                                                {" "}·{" "}
                                                            </span>
                                                            {formatSize(file.size)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shared-recipient-cell">
                                                    <div className="shared-recipient-avatar">
                                                        {ownerName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="shared-recipient-details">
                                                        <strong>
                                                            {owner?.name ||
                                                                owner?.username ||
                                                                "Unknown user"}
                                                        </strong>
                                                        <span>
                                                            {owner?.email ||
                                                                "No email"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shared-permission-cell">
                                                    <span
                                                        className={
                                                            permission === "write"
                                                                ? "shared-permission-badge write"
                                                                : "shared-permission-badge read"
                                                        }
                                                    >
                                                        <span className="shared-permission-dot" />
                                                        {getPermissionLabel(permission)}
                                                    </span>
                                                </div>

                                                <div className="shared-date-cell">
                                                    {formatDate(getShareDate(share))}
                                                </div>

                                                <div className="shared-actions-cell">
                                                    <button
                                                        type="button"
                                                        className="shared-action-button"
                                                        onClick={() =>
                                                            handleDownload(share)
                                                        }
                                                        disabled={downloadBusy}
                                                        title="Download shared file"
                                                    >
                                                        <Icon
                                                            name="download"
                                                            size={14}
                                                        />
                                                        {downloadBusy
                                                            ? "Downloading..."
                                                            : "Download"}
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