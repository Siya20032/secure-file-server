import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function SharedFiles() {
    const navigate = useNavigate();

    // =====================================================
    // CONFIGURATION
    // =====================================================

    const API_URL = "http://localhost:5000";

    // =====================================================
    // STATE
    // =====================================================

    const [sharedFiles, setSharedFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");

    const [searchTerm, setSearchTerm] = useState("");
    const [permissionFilter, setPermissionFilter] = useState("all");

    const [downloadingId, setDownloadingId] = useState(null);

    const [renamingId, setRenamingId] = useState(null);
    const [renameName, setRenameName] = useState("");

    const [showRenameModal, setShowRenameModal] = useState(false);
    const [selectedShare, setSelectedShare] = useState(null);

    // =====================================================
    // SHOW MESSAGE
    // =====================================================

    const showMessage = (text, type = "error") => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // GET SHARED FILES
    // =====================================================

    const fetchSharedFiles = async () => {
        try {
            setLoading(true);
            setMessage("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/shares/with-me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    data.message || "Failed to load shared files"
                );
                return;
            }

            setSharedFiles(data.shares || []);
        } catch (error) {
            console.error("Shared files error:", error);

            showMessage(
                "Unable to connect to the server. Please check that the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchSharedFiles();
    }, []);

    // =====================================================
    // FILTER FILES
    // =====================================================

    const filteredFiles = useMemo(() => {
        return sharedFiles.filter((share) => {
            const fileName =
                share.file?.originalName?.toLowerCase() || "";

            const ownerName =
                share.owner?.name?.toLowerCase() || "";

            const ownerEmail =
                share.owner?.email?.toLowerCase() || "";

            const search =
                searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                fileName.includes(search) ||
                ownerName.includes(search) ||
                ownerEmail.includes(search);

            const matchesPermission =
                permissionFilter === "all" ||
                share.permission === permissionFilter;

            return (
                matchesSearch &&
                matchesPermission
            );
        });
    }, [
        sharedFiles,
        searchTerm,
        permissionFilter,
    ]);

    // =====================================================
    // FORMAT FILE SIZE
    // =====================================================

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 B";

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }

        return `${(
            bytes /
            (1024 * 1024 * 1024)
        ).toFixed(1)} GB`;
    };

    // =====================================================
    // FILE TYPE
    // =====================================================

    const getFileType = (mimeType = "") => {
        const type = mimeType.toLowerCase();

        if (type.includes("pdf")) {
            return {
                label: "PDF",
                icon: "PDF",
                className:
                    "bg-red-50 text-red-600 border-red-100",
            };
        }

        if (
            type.includes("word") ||
            type.includes("document")
        ) {
            return {
                label: "DOC",
                icon: "DOC",
                className:
                    "bg-blue-50 text-blue-600 border-blue-100",
            };
        }

        if (
            type.includes("excel") ||
            type.includes("spreadsheet")
        ) {
            return {
                label: "XLS",
                icon: "XLS",
                className:
                    "bg-emerald-50 text-emerald-600 border-emerald-100",
            };
        }

        if (
            type.includes("image")
        ) {
            return {
                label: "IMG",
                icon: "IMG",
                className:
                    "bg-purple-50 text-purple-600 border-purple-100",
            };
        }

        if (
            type.includes("zip") ||
            type.includes("rar") ||
            type.includes("compressed")
        ) {
            return {
                label: "ZIP",
                icon: "ZIP",
                className:
                    "bg-amber-50 text-amber-600 border-amber-100",
            };
        }

        if (
            type.includes("text")
        ) {
            return {
                label: "TXT",
                icon: "TXT",
                className:
                    "bg-slate-100 text-slate-600 border-slate-200",
            };
        }

        return {
            label: "FILE",
            icon: "FILE",
            className:
                "bg-slate-100 text-slate-600 border-slate-200",
        };
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "Unknown";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =====================================================
    // DOWNLOAD
    // =====================================================

    const handleDownload = async (share) => {
        try {
            const token = getToken();

            const fileId =
                share.file?._id;

            if (!fileId) {
                showMessage(
                    "File information is unavailable."
                );
                return;
            }

            setDownloadingId(fileId);

            const response = await fetch(
                `${API_URL}/api/files/${fileId}/download`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                let data = {};

                try {
                    data = await response.json();
                } catch {
                    // Response was not JSON
                }

                showMessage(
                    data.message ||
                    "Unable to download the file."
                );

                return;
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                share.file?.originalName ||
                "download";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            showMessage(
                "File downloaded successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Download error:",
                error
            );

            showMessage(
                "Unable to download the file."
            );
        } finally {
            setDownloadingId(null);
        }
    };

    // =====================================================
    // OPEN RENAME MODAL
    // =====================================================

    const startRename = (share) => {
        setSelectedShare(share);

        setRenameName(
            share.file?.originalName || ""
        );

        setRenamingId(share._id);

        setShowRenameModal(true);

        setMessage("");
    };

    // =====================================================
    // CLOSE RENAME MODAL
    // =====================================================

    const closeRenameModal = () => {
        setShowRenameModal(false);
        setSelectedShare(null);
        setRenamingId(null);
        setRenameName("");
    };

    // =====================================================
    // RENAME
    // =====================================================

    const handleRename = async () => {
        try {
            if (!selectedShare) {
                return;
            }

            if (!renameName.trim()) {
                showMessage(
                    "File name cannot be empty."
                );
                return;
            }

            const token = getToken();

            const fileId =
                selectedShare.file?._id;

            if (!fileId) {
                showMessage(
                    "File information is unavailable."
                );
                return;
            }

            setRenamingId(selectedShare._id);

            const response = await fetch(
                `${API_URL}/api/files/${fileId}/rename`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        newName:
                            renameName.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                showMessage(
                    data.message ||
                    "Unable to rename file."
                );
                return;
            }

            closeRenameModal();

            showMessage(
                "File renamed successfully.",
                "success"
            );

            await fetchSharedFiles();
        } catch (error) {
            console.error(
                "Rename error:",
                error
            );

            showMessage(
                "Unable to rename the file."
            );
        } finally {
            setRenamingId(null);
        }
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalFiles =
        sharedFiles.length;

    const readFiles =
        sharedFiles.filter(
            (share) =>
                share.permission === "read"
        ).length;

    const writeFiles =
        sharedFiles.filter(
            (share) =>
                share.permission === "write"
        ).length;

    // =====================================================
    // SIDEBAR
    // =====================================================

    const Sidebar = () => {
        return (
            <aside className="hidden lg:flex w-64 bg-[#0f172a] text-white flex-col min-h-screen">

                {/* Brand */}

                <div className="px-6 py-6 border-b border-slate-800">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">

                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z"
                                />
                            </svg>

                        </div>

                        <div>

                            <h1 className="text-base font-bold tracking-tight">
                                Secure Files
                            </h1>

                            <p className="text-xs text-slate-500 mt-0.5">
                                File Management
                            </p>

                        </div>

                    </div>

                </div>

                {/* Navigation */}

                <nav className="flex-1 px-3 py-6">

                    <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        Workspace
                    </p>

                    {/* Dashboard */}

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    >

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1v-10.5z"
                            />
                        </svg>

                        Dashboard

                    </button>

                    {/* My Files */}

                    <button
                        onClick={() =>
                            navigate("/my-files")
                        }
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition mt-1"
                    >

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            />
                        </svg>

                        My Files

                    </button>

                    {/* Shared With Me */}

                    <button
                        onClick={() =>
                            navigate("/shared-files")
                        }
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-blue-600 text-white shadow-lg shadow-blue-950/30 mt-1"
                    >

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m3-3a4 4 0 100-8 4 4 0 000 8zm5-8a4 4 0 110 8"
                            />
                        </svg>

                        Shared With Me

                    </button>

                    {/* Profile */}

                    <button
                        onClick={() =>
                            navigate("/profile")
                        }
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition mt-1"
                    >

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 21a8 8 0 00-16 0m12-13a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>

                        Profile

                    </button>

                </nav>

                {/* Security */}

                <div className="px-4 pb-4">

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

                        <div className="flex items-center gap-2">

                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">

                                <svg
                                    className="w-4 h-4 text-emerald-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.291 9 11.623C17.176 19.291 21 14.591 21 9c0-1.065-.138-2.097-.382-3.016z"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p className="text-xs font-semibold text-white">
                                    Secure Access
                                </p>

                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    Permission protected
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Logout */}

                <div className="p-4 border-t border-slate-800">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
                    >

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                            />
                        </svg>

                        Sign out

                    </button>

                </div>

            </aside>
        );
    };

    // =====================================================
    // LOADING SKELETON
    // =====================================================

    const LoadingState = () => {
        return (
            <div className="divide-y divide-slate-100">

                {[1, 2, 3, 4].map(
                    (item) => (
                        <div
                            key={item}
                            className="px-6 py-5 animate-pulse"
                        >

                            <div className="flex items-center gap-4">

                                <div className="w-11 h-11 rounded-xl bg-slate-200" />

                                <div className="flex-1">

                                    <div className="h-4 bg-slate-200 rounded w-1/3" />

                                    <div className="h-3 bg-slate-100 rounded w-1/4 mt-2" />

                                </div>

                                <div className="h-8 w-20 bg-slate-200 rounded-lg" />

                            </div>

                        </div>
                    )
                )}

            </div>
        );
    };

    // =====================================================
    // EMPTY STATE
    // =====================================================

    const EmptyState = () => {
        const hasFilters =
            searchTerm ||
            permissionFilter !== "all";

        return (
            <div className="px-6 py-20 text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-5">

                    <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                    </svg>

                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    {hasFilters
                        ? "No matching files"
                        : "No shared files yet"}
                </h3>

                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">

                    {hasFilters
                        ? "Try adjusting your search or permission filter."
                        : "Files shared with your account will appear here."}

                </p>

                {hasFilters && (
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setPermissionFilter("all");
                        }}
                        className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                        Clear filters
                    </button>
                )}

            </div>
        );
    };

    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">

            {/* SIDEBAR */}

            <Sidebar />

            {/* MAIN */}

            <main className="flex-1 min-w-0">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="bg-white border-b border-slate-200">

                    <div className="px-5 sm:px-8 lg:px-10 py-5">

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <div className="flex items-center gap-2 mb-1">

                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                        Workspace
                                    </span>

                                    <span className="text-slate-300">
                                        /
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        Shared Files
                                    </span>

                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    Shared With Me
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Files and documents shared with your account
                                </p>

                            </div>

                            <button
                                onClick={fetchSharedFiles}
                                disabled={loading}
                                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50"
                            >

                                <svg
                                    className={`w-4 h-4 ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h5M20 20v-5h-5M5.07 9A7 7 0 0117.9 6.1L20 8m-2.93 7a7 7 0 01-12.83 2.9L2 16"
                                    />
                                </svg>

                                Refresh

                            </button>

                        </div>

                    </div>

                </header>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-5 sm:p-8 lg:p-10 max-w-[1500px]">

                    {/* MESSAGE */}

                    {message && (
                        <div
                            className={`mb-6 rounded-xl border px-4 py-3.5 flex items-center gap-3 ${
                                messageType === "success"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                            }`}
                        >

                            <div className="flex-shrink-0">

                                {messageType ===
                                "success" ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                                        />
                                    </svg>
                                )}

                            </div>

                            <p className="text-sm font-medium">
                                {message}
                            </p>

                        </div>
                    )}

                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    {!loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                            {/* Total */}

                            <div className="bg-white rounded-xl border border-slate-200 p-5">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-500">
                                            Total Shared
                                        </p>

                                        <p className="text-2xl font-bold text-slate-900 mt-2">
                                            {totalFiles}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Files available
                                        </p>

                                    </div>

                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                                        <svg
                                            className="w-5 h-5 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                            />
                                        </svg>

                                    </div>

                                </div>

                            </div>

                            {/* Read */}

                            <div className="bg-white rounded-xl border border-slate-200 p-5">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-500">
                                            Read Access
                                        </p>

                                        <p className="text-2xl font-bold text-slate-900 mt-2">
                                            {readFiles}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Download access
                                        </p>

                                    </div>

                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">

                                        <svg
                                            className="w-5 h-5 text-emerald-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="2.5"
                                                strokeWidth="1.8"
                                            />
                                        </svg>

                                    </div>

                                </div>

                            </div>

                            {/* Write */}

                            <div className="bg-white rounded-xl border border-slate-200 p-5">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-500">
                                            Write Access
                                        </p>

                                        <p className="text-2xl font-bold text-slate-900 mt-2">
                                            {writeFiles}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Edit permissions
                                        </p>

                                    </div>

                                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">

                                        <svg
                                            className="w-5 h-5 text-amber-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M12 20h9"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M16.5 3.5a2.121 2.121 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
                                            />
                                        </svg>

                                    </div>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* =================================================
                        FILE TABLE CARD
                    ================================================= */}

                    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                        {/* Card Header */}

                        <div className="px-5 sm:px-6 py-5 border-b border-slate-200">

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                                <div>

                                    <h3 className="text-base font-semibold text-slate-900">
                                        Shared files
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Manage files shared with you
                                    </p>

                                </div>

                                {/* Search + Filter */}

                                <div className="flex flex-col sm:flex-row gap-2">

                                    {/* Search */}

                                    <div className="relative">

                                        <svg
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                                            />
                                        </svg>

                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Search files..."
                                            className="w-full sm:w-56 pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                                        />

                                    </div>

                                    {/* Filter */}

                                    <select
                                        value={permissionFilter}
                                        onChange={(e) =>
                                            setPermissionFilter(
                                                e.target.value
                                            )
                                        }
                                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                                    >

                                        <option value="all">
                                            All permissions
                                        </option>

                                        <option value="read">
                                            Read access
                                        </option>

                                        <option value="write">
                                            Write access
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* Mobile Refresh */}

                        <div className="sm:hidden px-5 pt-4">

                            <button
                                onClick={fetchSharedFiles}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
                            >

                                <svg
                                    className={`w-4 h-4 ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h5M20 20v-5h-5M5.07 9A7 7 0 0117.9 6.1L20 8m-2.93 7a7 7 0 01-12.83 2.9L2 16"
                                    />
                                </svg>

                                Refresh

                            </button>

                        </div>

                        {/* Result Count */}

                        {!loading && (
                            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-100">

                                <p className="text-xs text-slate-500">

                                    Showing{" "}

                                    <span className="font-semibold text-slate-700">
                                        {filteredFiles.length}
                                    </span>{" "}

                                    of{" "}

                                    <span className="font-semibold text-slate-700">
                                        {sharedFiles.length}
                                    </span>{" "}

                                    shared files

                                </p>

                            </div>
                        )}

                        {/* Loading */}

                        {loading ? (
                            <LoadingState />
                        ) : filteredFiles.length === 0 ? (
                            <EmptyState />
                        ) : (

                            /* TABLE */

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[950px]">

                                    <thead>

                                        <tr className="bg-slate-50 border-b border-slate-200">

                                            <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                File
                                            </th>

                                            <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Shared by
                                            </th>

                                            <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Permission
                                            </th>

                                            <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Shared on
                                            </th>

                                            <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {filteredFiles.map(
                                            (share) => {

                                                const fileType =
                                                    getFileType(
                                                        share.file?.mimeType
                                                    );

                                                const ownerName =
                                                    share.owner?.name ||
                                                    "Unknown user";

                                                const ownerEmail =
                                                    share.owner?.email ||
                                                    "";

                                                const ownerInitial =
                                                    ownerName
                                                        .charAt(0)
                                                        .toUpperCase();

                                                return (
                                                    <tr
                                                        key={
                                                            share._id
                                                        }
                                                        className="hover:bg-slate-50/80 transition"
                                                    >

                                                        {/* FILE */}

                                                        <td className="px-6 py-5">

                                                            <div className="flex items-center gap-3">

                                                                <div
                                                                    className={`w-11 h-11 rounded-xl border flex items-center justify-center text-[9px] font-bold ${fileType.className}`}
                                                                >
                                                                    {fileType.icon}
                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[280px]">

                                                                        {
                                                                            share.file?.originalName ||
                                                                            "Unknown file"
                                                                        }

                                                                    </p>

                                                                    <div className="flex items-center gap-2 mt-1">

                                                                        <span className="text-xs text-slate-400">

                                                                            {
                                                                                fileType.label
                                                                            }

                                                                        </span>

                                                                        <span className="text-slate-300">
                                                                            •
                                                                        </span>

                                                                        <span className="text-xs text-slate-400">

                                                                            {
                                                                                formatFileSize(
                                                                                    share.file?.size
                                                                                )
                                                                            }

                                                                        </span>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* OWNER */}

                                                        <td className="px-6 py-5">

                                                            <div className="flex items-center gap-3">

                                                                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">

                                                                    {
                                                                        ownerInitial
                                                                    }

                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="text-sm font-medium text-slate-700 truncate max-w-[190px]">

                                                                        {
                                                                            ownerName
                                                                        }

                                                                    </p>

                                                                    <p className="text-xs text-slate-400 truncate max-w-[190px]">

                                                                        {
                                                                            ownerEmail
                                                                        }

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* PERMISSION */}

                                                        <td className="px-6 py-5">

                                                            {share.permission ===
                                                            "write" ? (

                                                                <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">

                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />

                                                                    Write

                                                                </span>

                                                            ) : (

                                                                <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">

                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                                                                    Read

                                                                </span>

                                                            )}

                                                        </td>

                                                        {/* DATE */}

                                                        <td className="px-6 py-5">

                                                            <p className="text-sm text-slate-600">

                                                                {
                                                                    formatDate(
                                                                        share.createdAt
                                                                    )
                                                                }

                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-0.5">

                                                                {
                                                                    formatTime(
                                                                        share.createdAt
                                                                    )
                                                                }

                                                            </p>

                                                        </td>

                                                        {/* ACTIONS */}

                                                        <td className="px-6 py-5">

                                                            <div className="flex items-center justify-end gap-2">

                                                                {/* DOWNLOAD */}

                                                                <button
                                                                    onClick={() =>
                                                                        handleDownload(
                                                                            share
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        downloadingId ===
                                                                        share.file?._id
                                                                    }
                                                                    title="Download file"
                                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >

                                                                    {downloadingId ===
                                                                    share.file?._id ? (

                                                                        <svg
                                                                            className="w-3.5 h-3.5 animate-spin"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                className="opacity-25"
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="currentColor"
                                                                                strokeWidth="4"
                                                                            />

                                                                            <path
                                                                                className="opacity-75"
                                                                                fill="currentColor"
                                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                                            />

                                                                        </svg>

                                                                    ) : (

                                                                        <svg
                                                                            className="w-3.5 h-3.5"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14"
                                                                            />
                                                                        </svg>

                                                                    )}

                                                                    {downloadingId ===
                                                                    share.file?._id
                                                                        ? "Downloading"
                                                                        : "Download"}

                                                                </button>

                                                                {/* RENAME */}

                                                                {share.permission ===
                                                                    "write" && (

                                                                    <button
                                                                        onClick={() =>
                                                                            startRename(
                                                                                share
                                                                            )
                                                                        }
                                                                        title="Rename file"
                                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition"
                                                                    >

                                                                        <svg
                                                                            className="w-3.5 h-3.5"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M16.862 3.487a2.25 2.25 0 013.182 3.182L7.5 19.213 3 20.5l1.287-4.5L16.862 3.487z"
                                                                            />
                                                                        </svg>

                                                                        Rename

                                                                    </button>

                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </section>

                    {/* =================================================
                        SECURITY INFORMATION
                    ================================================= */}

                    {!loading &&
                        sharedFiles.length > 0 && (

                            <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4">

                                <div className="flex items-start gap-3">

                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">

                                        <svg
                                            className="w-4 h-4 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z"
                                            />
                                        </svg>

                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-slate-800">
                                            Permission-based access
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">

                                            Read access allows file downloads.
                                            Write access additionally allows
                                            you to rename shared files.

                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                </div>

            </main>

            {/* =================================================
                RENAME MODAL
            ================================================= */}

            {showRenameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    {/* Overlay */}

                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={closeRenameModal}
                    />

                    {/* Modal */}

                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200">

                        {/* Header */}

                        <div className="px-6 py-5 border-b border-slate-100">

                            <div className="flex items-start justify-between">

                                <div>

                                    <h3 className="text-lg font-bold text-slate-900">
                                        Rename file
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Enter a new name for this file.
                                    </p>

                                </div>

                                <button
                                    onClick={closeRenameModal}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                >

                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>

                                </button>

                            </div>

                        </div>

                        {/* Body */}

                        <div className="px-6 py-6">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                File name
                            </label>

                            <input
                                type="text"
                                value={renameName}
                                onChange={(e) =>
                                    setRenameName(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key ===
                                        "Enter"
                                    ) {
                                        handleRename();
                                    }

                                    if (
                                        e.key ===
                                        "Escape"
                                    ) {
                                        closeRenameModal();
                                    }
                                }}
                                autoFocus
                                className="w-full px-3.5 py-3 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                            />

                            <p className="text-xs text-slate-400 mt-2">
                                The file will be renamed for all users who have access.
                            </p>

                        </div>

                        {/* Footer */}

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-end gap-2">

                            <button
                                onClick={closeRenameModal}
                                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleRename}
                                disabled={
                                    renamingId !== null &&
                                    !renameName.trim()
                                }
                                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {renamingId ? (
                                    <span className="flex items-center gap-2">

                                        <svg
                                            className="w-4 h-4 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />

                                        </svg>

                                        Saving...

                                    </span>
                                ) : (
                                    "Save changes"
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default SharedFiles;