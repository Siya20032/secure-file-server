import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyFiles.css";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =========================================================
   ICON SYSTEM
========================================================= */

const Icon = ({ name, size = 18, strokeWidth = 1.8 }) => {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    const icons = {
        grid: (
            <svg {...common}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),

        folder: (
            <svg {...common}>
                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
            </svg>
        ),

        share: (
            <svg {...common}>
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.8 7.5-4.4" />
                <path d="m8.2 13.2 7.5 4.4" />
            </svg>
        ),

        user: (
            <svg {...common}>
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
            </svg>
        ),

        logout: (
            <svg {...common}>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
            </svg>
        ),

        search: (
            <svg {...common}>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </svg>
        ),

        refresh: (
            <svg {...common}>
                <path d="M20 11a8 8 0 0 0-15.4-2.8" />
                <path d="M4 5v4h4" />
                <path d="M4 13a8 8 0 0 0 15.4 2.8" />
                <path d="M20 19v-4h-4" />
            </svg>
        ),

        download: (
            <svg {...common}>
                <path d="M12 3v11" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
            </svg>
        ),

        edit: (
            <svg {...common}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
            </svg>
        ),

        trash: (
            <svg {...common}>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
            </svg>
        ),

        lock: (
            <svg {...common}>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
        ),

        unlock: (
            <svg {...common}>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 7-2.5" />
            </svg>
        ),

        more: (
            <svg {...common}>
                <circle cx="5" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <circle cx="19" cy="12" r="1" fill="currentColor" />
            </svg>
        ),

        chevronLeft: (
            <svg {...common}>
                <path d="m15 18-6-6 6-6" />
            </svg>
        ),

        chevronRight: (
            <svg {...common}>
                <path d="m9 18 6-6-6-6" />
            </svg>
        ),

        file: (
            <svg {...common}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
            </svg>
        ),

        pdf: (
            <svg {...common}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 15h1.5a1.5 1.5 0 0 0 0-3H8v5" />
                <path d="M12 17v-5h1.2a2.5 2.5 0 0 1 0 5z" />
                <path d="M17 12h-2v5" />
                <path d="M15 14.5h1.7" />
            </svg>
        ),

        image: (
            <svg {...common}>
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m4 17 5-5 3 3 2-2 6 6" />
            </svg>
        ),

        document: (
            <svg {...common}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8" />
                <path d="M8 17h5" />
            </svg>
        ),

        shield: (
            <svg {...common}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        ),

        check: (
            <svg {...common}>
                <path d="m5 12 4 4L19 6" />
            </svg>
        ),

        alert: (
            <svg {...common}>
                <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </svg>
        ),

        cloud: (
            <svg {...common}>
                <path d="M17.5 19H8a5 5 0 1 1 1.1-9.9A6 6 0 0 1 20 11.5 3.5 3.5 0 0 1 17.5 19z" />
            </svg>
        ),

        history: (
            <svg {...common}>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 5v5h5" />
                <path d="M12 7v5l3 2" />
            </svg>
        ),

        close: (
            <svg {...common}>
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
            </svg>
        ),
    };

    return icons[name] || null;
};

/* =========================================================
   HELPERS
========================================================= */

const getToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    "";

const getFileId = (file) =>
    file?._id ||
    file?.id ||
    file?.fileId ||
    file?.file_id ||
    "";

const getFileName = (file) =>
    file?.originalName ||
    file?.filename ||
    file?.fileName ||
    file?.name ||
    "Unnamed file";

const getVersionNumber = (version) =>
    version?.version ??
    version?.versionNumber ??
    version?.number ??
    null;

const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
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
    };

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    );

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
                "Something went wrong"
        );
    }

    return data;
};

const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";

    const units = ["B", "KB", "MB", "GB"];

    const index = Math.min(
        Math.floor(
            Math.log(bytes) / Math.log(1024)
        ),
        units.length - 1
    );

    return `${(
        bytes /
        Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 2)} ${
        units[index]
    }`;
};

const formatDate = (date) => {
    if (!date) return "Unknown";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const formatDateTime = (date) => {
    if (!date) return "Unknown";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown";
    }

    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

const getFileType = (file) => {
    const mime = (
        file?.mimeType ||
        file?.mimetype ||
        file?.type ||
        ""
    ).toLowerCase();

    const name = getFileName(file).toLowerCase();

    if (
        mime === "application/pdf" ||
        name.endsWith(".pdf")
    ) {
        return "PDF";
    }

    if (
        mime.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
            name
        )
    ) {
        return "IMAGE";
    }

    if (
        mime === "text/plain" ||
        name.endsWith(".txt")
    ) {
        return "TEXT";
    }

    if (
        mime.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) {
        return "WORD";
    }

    if (
        mime.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx")
    ) {
        return "EXCEL";
    }

    return "FILE";
};

const getFileIcon = (file) => {
    const type = getFileType(file);

    if (type === "PDF") return "pdf";

    if (type === "IMAGE") return "image";

    if (
        type === "WORD" ||
        type === "EXCEL" ||
        type === "TEXT"
    ) {
        return "document";
    }

    return "file";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function MyFiles() {
    const navigate = useNavigate();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({
            currentPage: 1,
            filesPerPage: 10,
            totalFiles: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
        });

    const [error, setError] = useState("");

    const [actionLoading, setActionLoading] =
        useState(null);

    const [toast, setToast] = useState(null);

    const [user, setUser] = useState({
        name: "User",
        email: "",
    });

    const [openMenu, setOpenMenu] = useState(null);

    const [modal, setModal] = useState(null);

    const [renameValue, setRenameValue] =
        useState("");

    const [shareEmail, setShareEmail] =
        useState("");

    const [sharePermission, setSharePermission] =
        useState("read");

    const [versions, setVersions] = useState([]);

    const [versionsLoading, setVersionsLoading] =
        useState(false);

    /* =====================================================
       USER
    ===================================================== */

    useEffect(() => {
        try {
            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) return;

            const parsed =
                JSON.parse(storedUser);

            setUser({
                name:
                    parsed?.name ||
                    parsed?.username ||
                    "User",

                email:
                    parsed?.email || "",
            });
        } catch {
            // Ignore invalid localStorage data
        }
    }, []);

    /* =====================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ===================================================== */

    useEffect(() => {
        const handleOutsideClick = () => {
            setOpenMenu(null);
        };

        if (openMenu !== null) {
            document.addEventListener(
                "click",
                handleOutsideClick
            );
        }

        return () => {
            document.removeEventListener(
                "click",
                handleOutsideClick
            );
        };
    }, [openMenu]);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (
        message,
        toastType = "success"
    ) => {
        setToast({
            message,
            type: toastType,
        });

        window.setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    /* =====================================================
       FETCH FILES
    ===================================================== */

    const fetchFiles = async (
        page = currentPage
    ) => {
        try {
            setLoading(true);
            setError("");

            const params =
                new URLSearchParams();

            params.set("page", String(page));
            params.set("limit", "10");

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim()
                );
            }

            if (type) {
                params.set("type", type);
            }

            const data =
                await apiRequest(
                    `/files?${params.toString()}`
                );

            const fetchedFiles =
                Array.isArray(data?.files)
                    ? data.files
                    : [];

            setFiles(fetchedFiles);

            const serverPagination =
                data?.pagination;

            if (serverPagination) {
                setPagination({
                    currentPage:
                        Number(
                            serverPagination.currentPage
                        ) || page,

                    filesPerPage:
                        Number(
                            serverPagination.filesPerPage
                        ) || 10,

                    totalFiles:
                        Number(
                            serverPagination.totalFiles
                        ) || 0,

                    totalPages:
                        Number(
                            serverPagination.totalPages
                        ) || 1,

                    hasNextPage:
                        Boolean(
                            serverPagination.hasNextPage
                        ),

                    hasPreviousPage:
                        Boolean(
                            serverPagination.hasPreviousPage
                        ),
                });
            } else {
                setPagination({
                    currentPage: page,
                    filesPerPage: 10,
                    totalFiles:
                        fetchedFiles.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                });
            }
        } catch (err) {
            console.error(
                "Fetch files error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to load your files."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentPage);
    }, [currentPage, type]);

    useEffect(() => {
        const timer =
            window.setTimeout(() => {
                setCurrentPage(1);
            }, 450);

        return () => {
            window.clearTimeout(timer);
        };
    }, [search]);

    useEffect(() => {
        const timer =
            window.setTimeout(() => {
                fetchFiles(1);
            }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [search]);

    /* =====================================================
       DOWNLOAD FILE
    ===================================================== */

    const handleDownload = async (file) => {
        const id = getFileId(file);

        if (!id) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        try {
            setOpenMenu(null);

            setActionLoading(
                `download-${id}`
            );

            const token = getToken();

            const response =
                await fetch(
                    `${API_BASE_URL}/files/${id}/download`,
                    {
                        headers: token
                            ? {
                                  Authorization: `Bearer ${token}`,
                              }
                            : {},
                    }
                );

            if (!response.ok) {
                let message =
                    "Download failed.";

                try {
                    const data =
                        await response.json();

                    message =
                        data?.message ||
                        data?.error ||
                        message;
                } catch {
                    // Response was not JSON
                }

                throw new Error(message);
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const anchor =
                document.createElement(
                    "a"
                );

            anchor.href = url;

            anchor.download =
                getFileName(file);

            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(
                url
            );

            showToast(
                "File downloaded successfully."
            );
        } catch (err) {
            showToast(
                err?.message ||
                    "Download failed.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       LOCK / UNLOCK
    ===================================================== */

    const handleLockToggle = async (
        file
    ) => {
        const id = getFileId(file);

        if (!id) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        const isLocked = Boolean(
            file?.isLocked
        );

        const endpoint = isLocked
            ? `/files/${id}/unlock`
            : `/files/${id}/lock`;

        try {
            setOpenMenu(null);

            setActionLoading(
                `${
                    isLocked
                        ? "unlock"
                        : "lock"
                }-${id}`
            );

            const data =
                await apiRequest(
                    endpoint,
                    {
                        method: "PUT",
                    }
                );

            setFiles((previous) =>
                previous.map((item) => {
                    const itemId =
                        getFileId(item);

                    if (itemId !== id) {
                        return item;
                    }

                    return {
                        ...item,

                        isLocked:
                            !isLocked,

                        lockedBy:
                            !isLocked
                                ? data?.file
                                      ?.lockedBy ||
                                  item.owner ||
                                  item.ownerId ||
                                  null
                                : null,

                        lockedAt:
                            !isLocked
                                ? data?.file
                                      ?.lockedAt ||
                                  new Date()
                                : null,
                    };
                })
            );

            showToast(
                data?.message ||
                    (isLocked
                        ? "File unlocked."
                        : "File locked.")
            );

            await fetchFiles(
                currentPage
            );
        } catch (err) {
            showToast(
                err?.message ||
                    "Unable to change file lock status.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       VERSION HISTORY
    ===================================================== */

    const openVersionModal = async (
        file
    ) => {
        const id = getFileId(file);

        if (!id) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        setOpenMenu(null);

        setModal({
            type: "versions",
            file,
        });

        setVersions([]);

        setVersionsLoading(true);

        try {
            const data =
                await apiRequest(
                    `/files/${id}/versions`
                );

            const versionList =
                data?.versions ||
                data?.file?.versions ||
                data?.data ||
                [];

            setVersions(
                Array.isArray(versionList)
                    ? versionList
                    : []
            );
        } catch (err) {
            console.error(
                "Version history error:",
                err
            );

            showToast(
                err?.message ||
                    "Unable to load version history.",
                "error"
            );
        } finally {
            setVersionsLoading(false);
        }
    };

    /* =====================================================
       DOWNLOAD VERSION
    ===================================================== */

    const handleDownloadVersion = async (
        file,
        version
    ) => {
        const fileId =
            getFileId(file);

        const versionNumber =
            getVersionNumber(version);

        if (!fileId) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        if (
            versionNumber === null ||
            versionNumber === undefined
        ) {
            showToast(
                "Invalid version selected.",
                "error"
            );
            return;
        }

        try {
            setActionLoading(
                `version-download-${fileId}-${versionNumber}`
            );

            const token = getToken();

            const endpoint =
                `/files/${fileId}/versions/${versionNumber}/download`;

            const response =
                await fetch(
                    `${API_BASE_URL}${endpoint}`,
                    {
                        headers: token
                            ? {
                                  Authorization: `Bearer ${token}`,
                              }
                            : {},
                    }
                );

            if (!response.ok) {
                let message =
                    "Unable to download this file version.";

                try {
                    const data =
                        await response.json();

                    message =
                        data?.message ||
                        data?.error ||
                        message;
                } catch {
                    // Ignore invalid JSON
                }

                throw new Error(message);
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const anchor =
                document.createElement(
                    "a"
                );

            anchor.href = url;

            anchor.download =
                version?.originalName ||
                `${getFileName(
                    file
                )}-v${versionNumber}`;

            document.body.appendChild(
                anchor
            );

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(
                url
            );

            showToast(
                `Version ${versionNumber} downloaded successfully.`
            );
        } catch (err) {
            showToast(
                err?.message ||
                    "Version download failed.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       RESTORE VERSION
    ===================================================== */

    const handleRestoreVersion = async (
        file,
        version
    ) => {
        const fileId =
            getFileId(file);

        const versionNumber =
            getVersionNumber(version);

        if (!fileId) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        if (
            versionNumber === null ||
            versionNumber === undefined
        ) {
            showToast(
                "Invalid version selected.",
                "error"
            );
            return;
        }

        try {
            setActionLoading(
                `restore-${fileId}-${versionNumber}`
            );

            const data =
                await apiRequest(
                    `/files/${fileId}/versions/${versionNumber}/restore`,
                    {
                        method: "POST",
                    }
                );

            showToast(
                data?.message ||
                    `Version ${versionNumber} restored successfully.`
            );

            setModal(null);

            await fetchFiles(
                currentPage
            );
        } catch (err) {
            showToast(
                err?.message ||
                    "Unable to restore this version.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       RENAME
    ===================================================== */

    const openRenameModal = (
        file
    ) => {
        if (file?.isLocked) {
            showToast(
                "Unlock the file before renaming it.",
                "error"
            );
            return;
        }

        setOpenMenu(null);

        setRenameValue(
            getFileName(file)
        );

        setModal({
            type: "rename",
            file,
        });
    };

    const handleRename = async () => {
        const file =
            modal?.file;

        if (!file) return;

        const id =
            getFileId(file);

        if (!id) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        const trimmedName =
            renameValue.trim();

        if (!trimmedName) {
            showToast(
                "Enter a valid file name.",
                "error"
            );
            return;
        }

        try {
            setActionLoading(
                `rename-${id}`
            );

            const data =
                await apiRequest(
                    `/files/${id}/rename`,
                    {
                        method: "PUT",

                        body: JSON.stringify({
                            newName:
                                trimmedName,
                        }),
                    }
                );

            setFiles((previous) =>
                previous.map((item) =>
                    getFileId(item) === id
                        ? {
                              ...item,

                              originalName:
                                  data
                                      ?.file
                                      ?.originalName ||
                                  data
                                      ?.file
                                      ?.filename ||
                                  trimmedName,

                              updatedAt:
                                  data
                                      ?.file
                                      ?.updatedAt ||
                                  new Date(),
                          }
                        : item
                )
            );

            setModal(null);

            showToast(
                data?.message ||
                    "File renamed successfully."
            );
        } catch (err) {
            showToast(
                err?.message ||
                    "File rename failed.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       SHARE
    ===================================================== */

    const openShareModal = (
        file
    ) => {
        setOpenMenu(null);

        setShareEmail("");

        setSharePermission(
            "read"
        );

        setModal({
            type: "share",
            file,
        });
    };

    const handleShare = async () => {
        const file =
            modal?.file;

        if (!file) return;

        const id =
            getFileId(file);

        if (!id) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        const email =
            shareEmail
                .trim()
                .toLowerCase();

        if (!email) {
            showToast(
                "Enter the user's email address.",
                "error"
            );
            return;
        }

        try {
            setActionLoading(
                `share-${id}`
            );

            const data =
                await apiRequest(
                    `/shares`,
                    {
                        method: "POST",

                        body: JSON.stringify({
                            fileId: id,
                            email,
                            permission:
                                sharePermission,
                        }),
                    }
                );

            setModal(null);

            setShareEmail("");

            setSharePermission(
                "read"
            );

            showToast(
                data?.message ||
                    "File shared successfully."
            );
        } catch (err) {
            console.error(
                "Share file error:",
                err
            );

            showToast(
                err?.message ||
                    "File sharing failed.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const openDeleteModal = (
        file
    ) => {
        if (file?.isLocked) {
            showToast(
                "Unlock the file before deleting it.",
                "error"
            );
            return;
        }

        setOpenMenu(null);

        setModal({
            type: "delete",
            file,
        });
    };

    const handleDelete = async () => {
        const file =
            modal?.file;

        if (!file) return;

        const id =
            getFileId(file);

        if (!id) {
            showToast(
                "File ID is missing.",
                "error"
            );
            return;
        }

        try {
            setActionLoading(
                `delete-${id}`
            );

            const data =
                await apiRequest(
                    `/files/${id}`,
                    {
                        method: "DELETE",
                    }
                );

            setFiles((previous) =>
                previous.filter(
                    (item) =>
                        getFileId(item) !==
                        id
                )
            );

            setModal(null);

            showToast(
                data?.message ||
                    "File deleted successfully."
            );

            await fetchFiles(
                currentPage
            );
        } catch (err) {
            showToast(
                err?.message ||
                    "File deletion failed.",
                "error"
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {
        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate("/login");
    };

    /* =====================================================
       COUNTERS
    ===================================================== */

    const lockedCount =
        useMemo(
            () =>
                files.filter(
                    (file) =>
                        Boolean(
                            file?.isLocked
                        )
                ).length,
            [files]
        );

    const unlockedCount =
        Math.max(
            0,
            files.length -
                lockedCount
        );

    const avatarLetter = (
        user.name || "U"
    )
        .charAt(0)
        .toUpperCase();

    /* =====================================================
       PAGE NUMBERS
    ===================================================== */

    const pageNumbers =
        useMemo(() => {
            const totalPages =
                Math.max(
                    1,
                    Number(
                        pagination.totalPages
                    ) || 1
                );

            const current =
                Math.min(
                    Math.max(
                        1,
                        Number(
                            currentPage
                        ) || 1
                    ),
                    totalPages
                );

            const pages = [];

            const start =
                Math.max(
                    1,
                    current - 2
                );

            const end =
                Math.min(
                    totalPages,
                    current + 2
                );

            for (
                let page = start;
                page <= end;
                page += 1
            ) {
                pages.push(page);
            }

            return pages;
        }, [
            pagination.totalPages,
            currentPage,
        ]);

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="sf-app">
            <div className="sf-layout">

{/* =================================================
    DASHBOARD-STYLE NAVBAR — MY FILES
================================================= */}

<header className="dashboard-navbar">
    <div className="navbar-left">

        <button
            type="button"
            className="brand-button"
            onClick={() => navigate("/dashboard")}
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
                type="button"
                className="nav-link"
                onClick={() => navigate("/dashboard")}
            >
                Overview
            </button>

            <button
                type="button"
                className="nav-link active"
                onClick={() => navigate("/my-files")}
            >
                My Files
            </button>

            <button
                type="button"
                className="nav-link"
                onClick={() => navigate("/shared-with-me")}
            >
                Shared with me
            </button>

            <button
                type="button"
                className="nav-link"
                onClick={() => navigate("/shared-by-me")}
            >
                Shared by me
            </button>

        </nav>
    </div>

    <div className="navbar-right">

        <div className="user-avatar">
            {avatarLetter}
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
                    MAIN
                ================================================= */}

                <main className="sf-main">

                   
                    <div className="sf-content">
                       

       



                        {/* =================================================
                            PAGE HEADER
                        ================================================= */}

                        <div className="sf-page-heading">

                            <div>

                                <div className="sf-breadcrumb">

                                    <span>
                                        Workspace
                                    </span>

                                    <span>/</span>

                                    <span className="sf-breadcrumb-current">
                                        My Files
                                    </span>

                                </div>

                                <h1 className="sf-page-title">
                                    My Files
                                </h1>

                                <p className="sf-page-description">
                                    Securely manage,
                                    organize and control
                                    access to your files.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="sf-refresh"
                                onClick={() =>
                                    fetchFiles(
                                        currentPage
                                    )
                                }
                                disabled={
                                    loading
                                }
                            >
                                <Icon
                                    name="refresh"
                                    size={13}
                                />

                                {loading
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>

                        </div>

                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (
                            <div className="sf-error">

                                <div className="sf-error-left">

                                    <Icon
                                        name="alert"
                                        size={14}
                                    />

                                    {error}

                                </div>

                                <button
                                    type="button"
                                    className="sf-retry"
                                    onClick={() =>
                                        fetchFiles(
                                            currentPage
                                        )
                                    }
                                >
                                    Retry
                                </button>

                            </div>
                        )}

                        {/* =================================================
                            OVERVIEW
                        ================================================= */}

                        <section className="sf-overview">

                            <div className="sf-overview-card">

                                <div>

                                    <div className="sf-overview-label">
                                        Total files
                                    </div>

                                    <div className="sf-overview-value">
                                        {
                                            pagination.totalFiles
                                        }
                                    </div>

                                    <div className="sf-overview-meta">
                                        Files in your workspace
                                    </div>

                                </div>

                                <div className="sf-overview-icon blue">
                                    <Icon
                                        name="folder"
                                        size={18}
                                    />
                                </div>

                            </div>

                            <div className="sf-overview-card">

                                <div>

                                    <div className="sf-overview-label">
                                        Current view
                                    </div>

                                    <div className="sf-overview-value">
                                        {
                                            files.length
                                        }
                                    </div>

                                    <div className="sf-overview-meta">
                                        {unlockedCount} available
                                        for access
                                    </div>

                                </div>

                                <div className="sf-overview-icon green">
                                    <Icon
                                        name="cloud"
                                        size={18}
                                    />
                                </div>

                            </div>

                            <div className="sf-overview-card">

                                <div>

                                    <div className="sf-overview-label">
                                        Protected
                                    </div>

                                    <div className="sf-overview-value">
                                        {
                                            lockedCount
                                        }
                                    </div>

                                    <div className="sf-overview-meta">
                                        Locked files
                                    </div>

                                </div>

                                <div className="sf-overview-icon amber">
                                    <Icon
                                        name="lock"
                                        size={18}
                                    />
                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            TOOLBAR
                        ================================================= */}

                        <div className="sf-toolbar">

                            <div className="sf-toolbar-search">

                                <Icon
                                    name="search"
                                    size={14}
                                />

                                <input
                                    value={
                                        search
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search by file name..."
                                    aria-label="Search files"
                                />

                            </div>

                            <select
                                className="sf-type-select"
                                value={
                                    type
                                }
                                onChange={(
                                    e
                                ) => {
                                    setType(
                                        e.target.value
                                    );

                                    setCurrentPage(
                                        1
                                    );
                                }}
                            >
                                <option value="">
                                    All file types
                                </option>

                                <option value="pdf">
                                    PDF
                                </option>

                                <option value="image">
                                    Images
                                </option>

                                <option value="text">
                                    Text
                                </option>

                                <option value="word">
                                    Word
                                </option>

                                <option value="excel">
                                    Excel
                                </option>

                            </select>

                        </div>

                        {/* =================================================
                            TABLE
                        ================================================= */}

                        <section className="sf-table-card">

                            <div className="sf-table-heading">

                                <div>

                                    <h2 className="sf-table-title">
                                        Files
                                    </h2>

                                    <div className="sf-table-subtitle">
                                        {pagination.totalFiles ===
                                        1
                                            ? "1 file in your workspace"
                                            : `${pagination.totalFiles} files in your workspace`}
                                    </div>

                                </div>

                                <div className="sf-page-count">
                                    Page{" "}
                                    {
                                        pagination.currentPage
                                    }{" "}
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </div>

                            </div>

                            <div className="sf-table-header">

                                <div>
                                    File
                                </div>

                                <div>
                                    Type
                                </div>

                                <div>
                                    Size
                                </div>

                                <div>
                                    Version
                                </div>

                                <div>
                                    Security
                                </div>

                                <div />

                            </div>

                            {/* =================================================
                                LOADING
                            ================================================= */}

                            {loading ? (
                                <div className="sf-loading">

                                    <div className="sf-spinner" />

                                    Loading your secure files...

                                </div>
                            ) : files.length === 0 ? (

                                <div className="sf-empty">

                                    <div className="sf-empty-icon">
                                        <Icon
                                            name="folder"
                                            size={21}
                                        />
                                    </div>

                                    <div className="sf-empty-title">
                                        No files found
                                    </div>

                                    <div className="sf-empty-description">
                                        {search ||
                                        type
                                            ? "Try adjusting your search or file type filter."
                                            : "Files uploaded to your workspace will appear here."}
                                    </div>

                                </div>
                            ) : (

                                files.map(
                                    (
                                        file,
                                        index
                                    ) => {

                                        const id =
                                            getFileId(
                                                file
                                            );

                                        const fileType =
                                            getFileType(
                                                file
                                            );

                                        const icon =
                                            getFileIcon(
                                                file
                                            );

                                        const version =
                                            file?.currentVersion ??
                                            file?.version ??
                                            1;

                                        const locked =
                                            Boolean(
                                                file?.isLocked
                                            );

                                        const busy =
                                            actionLoading?.endsWith(
                                                `-${id}`
                                            );

                                        return (
                                            <div
                                                className="sf-file-row"
                                                key={
                                                    id ||
                                                    `${getFileName(
                                                        file
                                                    )}-${index}`
                                                }
                                            >

                                                {/* FILE */}

                                                <div className="sf-file-info">

                                                    <div
                                                        className={`sf-file-icon ${
                                                            fileType ===
                                                            "PDF"
                                                                ? "pdf"
                                                                : fileType ===
                                                                  "IMAGE"
                                                                ? "image"
                                                                : fileType ===
                                                                      "WORD" ||
                                                                  fileType ===
                                                                      "EXCEL" ||
                                                                  fileType ===
                                                                      "TEXT"
                                                                ? "document"
                                                                : ""
                                                        }`}
                                                    >
                                                        <Icon
                                                            name={
                                                                icon
                                                            }
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </div>

                                                    <div className="sf-file-details">

                                                        <div
                                                            className="sf-file-name"
                                                            title={
                                                                getFileName(
                                                                    file
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getFileName(
                                                                    file
                                                                )
                                                            }
                                                        </div>

                                                        <div className="sf-file-meta">

                                                            <span>
                                                                Uploaded{" "}
                                                                {formatDate(
                                                                    file?.createdAt ||
                                                                        file?.uploadedAt
                                                                )}
                                                            </span>

                                                            <span className="sf-dot" />

                                                            <span>
                                                                Secure storage
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* TYPE */}

                                                <div className="sf-cell">

                                                    <span className="sf-type">
                                                        {
                                                            fileType
                                                        }
                                                    </span>

                                                </div>

                                                {/* SIZE */}

                                                <div className="sf-cell">

                                                    {formatSize(
                                                        file?.size ??
                                                            file?.fileSize
                                                    )}

                                                </div>

                                                {/* VERSION */}

                                                <div className="sf-cell">

                                                    <button
                                                        type="button"
                                                        className="sf-version sf-version-button"
                                                        onClick={() =>
                                                            openVersionModal(
                                                                file
                                                            )
                                                        }
                                                        title="View version history"
                                                    >
                                                        v
                                                        {
                                                            version
                                                        }
                                                    </button>

                                                </div>

                                                {/* SECURITY */}

                                                <div className="sf-cell">

                                                    {locked ? (
                                                        <span className="sf-status locked">

                                                            <span className="sf-status-dot" />

                                                            Locked

                                                        </span>
                                                    ) : (
                                                        <span className="sf-status unlocked">

                                                            <span className="sf-status-dot" />

                                                            Unlocked

                                                        </span>
                                                    )}

                                                </div>

                                                {/* ACTIONS */}

                                                <div
                                                    className="sf-action-wrap"
                                                    style={{ position: "relative", overflow: "visible" }}
                                                    onClick={(
                                                        e
                                                    ) =>
                                                        e.stopPropagation()
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        className={`sf-more-button ${
                                                            openMenu ===
                                                            id
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={(
                                                            e
                                                        ) => {
                                                            e.stopPropagation();

                                                            setOpenMenu(
                                                                openMenu ===
                                                                    id
                                                                    ? null
                                                                    : id
                                                            );
                                                        }}
                                                        disabled={
                                                            busy
                                                        }
                                                        aria-label="File actions"
                                                    >
                                                        <Icon
                                                            name="more"
                                                            size={17}
                                                        />
                                                    </button>

                                                    {openMenu ===
                                                        id && (
                                                        <div
                                                            className="sf-action-menu"
                                                            style={{
                                                                position: "absolute",
                                                                right: 0,
                                                                bottom: "calc(100% + 6px)",
                                                                top: "auto",
                                                                zIndex: 9999,
                                                                minWidth: 190,
                                                                maxHeight: 320,
                                                                overflowY: "auto",
                                                                background: "#ffffff",
                                                                border: "1px solid #e2e8f0",
                                                                borderRadius: 10,
                                                                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
                                                            }}
                                                        >

                                                            <button
                                                                type="button"
                                                                className="sf-menu-item"
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        file
                                                                    )
                                                                }
                                                            >
                                                                <Icon
                                                                    name="download"
                                                                    size={14}
                                                                />

                                                                Download
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="sf-menu-item"
                                                                onClick={() =>
                                                                    openVersionModal(
                                                                        file
                                                                    )
                                                                }
                                                            >
                                                                <Icon
                                                                    name="history"
                                                                    size={14}
                                                                />

                                                                Version history
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="sf-menu-item"
                                                                onClick={() =>
                                                                    openRenameModal(
                                                                        file
                                                                    )
                                                                }
                                                                disabled={
                                                                    locked
                                                                }
                                                            >
                                                                <Icon
                                                                    name="edit"
                                                                    size={14}
                                                                />

                                                                Rename
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="sf-menu-item"
                                                                onClick={() =>
                                                                    openShareModal(
                                                                        file
                                                                    )
                                                                }
                                                            >
                                                                <Icon
                                                                    name="share"
                                                                    size={14}
                                                                />

                                                                Share access
                                                            </button>

                                                            <div className="sf-menu-divider" />

                                                            <button
                                                                type="button"
                                                                className="sf-menu-item"
                                                                onClick={() =>
                                                                    handleLockToggle(
                                                                        file
                                                                    )
                                                                }
                                                            >
                                                                <Icon
                                                                    name={
                                                                        locked
                                                                            ? "unlock"
                                                                            : "lock"
                                                                    }
                                                                    size={14}
                                                                />

                                                                {locked
                                                                    ? "Unlock file"
                                                                    : "Lock file"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="sf-menu-item danger"
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        file
                                                                    )
                                                                }
                                                                disabled={
                                                                    locked
                                                                }
                                                            >
                                                                <Icon
                                                                    name="trash"
                                                                    size={14}
                                                                />

                                                                Delete file
                                                            </button>

                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        );
                                    }
                                )
                            )}

                            {/* =================================================
                                PAGINATION
                            ================================================= */}

                            {!loading &&
                                files.length >
                                    0 && (
                                    <div className="sf-pagination">

                                        <div className="sf-pagination-text">

                                            Showing{" "}
                                            {
                                                files.length
                                            }{" "}
                                            of{" "}
                                            {
                                                pagination.totalFiles
                                            }{" "}
                                            files

                                        </div>

                                        <div className="sf-pagination-buttons">

                                            <button
                                                type="button"
                                                className="sf-page-button"
                                                disabled={
                                                    currentPage <=
                                                        1 ||
                                                    !pagination.hasPreviousPage
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
                                                        Math.max(
                                                            1,
                                                            currentPage -
                                                                1
                                                        )
                                                    )
                                                }
                                                aria-label="Previous page"
                                            >
                                                <Icon
                                                    name="chevronLeft"
                                                    size={13}
                                                />
                                            </button>

                                            {pageNumbers.map(
                                                (
                                                    page
                                                ) => (
                                                    <button
                                                        type="button"
                                                        key={
                                                            page
                                                        }
                                                        className={`sf-page-number ${
                                                            currentPage ===
                                                            page
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentPage(
                                                                page
                                                            )
                                                        }
                                                    >
                                                        {
                                                            page
                                                        }
                                                    </button>
                                                )
                                            )}

                                            <button
                                                type="button"
                                                className="sf-page-button"
                                                disabled={
                                                    currentPage >=
                                                        pagination.totalPages ||
                                                    !pagination.hasNextPage
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
                                                        Math.min(
                                                            pagination.totalPages ||
                                                                1,
                                                            currentPage +
                                                                1
                                                        )
                                                    )
                                                }
                                                aria-label="Next page"
                                            >
                                                <Icon
                                                    name="chevronRight"
                                                    size={13}
                                                />
                                            </button>

                                        </div>

                                    </div>
                                )}

                        </section>

                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <footer className="sf-footer">

                            <span>
                                Secure Files · Enterprise
                                File Management
                            </span>

                            <span>
                                <Icon
                                    name="shield"
                                    size={10}
                                />{" "}
                                Authenticated workspace
                            </span>

                        </footer>

                    </div>

                </main>

            </div>

            {/* =====================================================
                MODALS
            ===================================================== */}

            {modal && (
                <div
                    className="sf-modal-overlay"
                    onMouseDown={(
                        e
                    ) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setModal(null);
                        }
                    }}
                >

                    <div className="sf-modal">

                        {/* =================================================
                            VERSION MODAL
                        ================================================= */}

                        {modal.type ===
                            "versions" && (
                            <>
                                <div className="sf-modal-header">

                                    <div>

                                        <div className="sf-modal-title">
                                            Version history
                                        </div>

                                        <div className="sf-version-modal-file">
                                            {modal.file
                                                ? getFileName(
                                                      modal.file
                                                  )
                                                : "File"}
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="sf-modal-close"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                        aria-label="Close"
                                    >
                                        <Icon
                                            name="close"
                                            size={14}
                                        />
                                    </button>

                                </div>

                                <div className="sf-modal-body sf-version-modal-body">

                                    <p className="sf-modal-description">
                                        View, download, or restore
                                        previous versions of this file.
                                    </p>

                                    {versionsLoading ? (
                                        <div className="sf-version-loading">

                                            <div className="sf-spinner" />

                                            Loading version history...

                                        </div>
                                    ) : versions.length ===
                                      0 ? (
                                        <div className="sf-version-empty">

                                            <div className="sf-empty-icon">
                                                <Icon
                                                    name="history"
                                                    size={20}
                                                />
                                            </div>

                                            <div className="sf-empty-title">
                                                No previous versions
                                            </div>

                                            <div className="sf-empty-description">
                                                Version history will appear
                                                here when new versions are created.
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="sf-version-list">

                                            {versions.map(
                                                (
                                                    versionItem,
                                                    index
                                                ) => {

                                                    const versionNumber =
                                                        getVersionNumber(
                                                            versionItem
                                                        );

                                                    const safeVersionNumber =
                                                        versionNumber ??
                                                        Math.max(
                                                            1,
                                                            versions.length -
                                                                index
                                                        );

                                                    const currentVersion =
                                                        modal
                                                            ?.file
                                                            ?.currentVersion ??
                                                        modal
                                                            ?.file
                                                            ?.version ??
                                                        1;

                                                    const isCurrent =
                                                        Number(
                                                            safeVersionNumber
                                                        ) ===
                                                        Number(
                                                            currentVersion
                                                        );

                                                    const versionSize =
                                                        versionItem?.size ??
                                                        versionItem?.fileSize ??
                                                        versionItem?.file_size ??
                                                        modal
                                                            ?.file
                                                            ?.size;

                                                    const versionDate =
                                                        versionItem?.createdAt ||
                                                        versionItem?.uploadedAt ||
                                                        versionItem?.date ||
                                                        versionItem?.timestamp;

                                                    const fileId =
                                                        getFileId(
                                                            modal.file
                                                        );

                                                    const restoreBusy =
                                                        actionLoading ===
                                                        `restore-${fileId}-${safeVersionNumber}`;

                                                    const downloadBusy =
                                                        actionLoading ===
                                                        `version-download-${fileId}-${safeVersionNumber}`;

                                                    return (
                                                        <div
                                                            className={`sf-version-item ${
                                                                isCurrent
                                                                    ? "current"
                                                                    : ""
                                                            }`}
                                                            key={
                                                                versionItem?._id ||
                                                                versionItem?.id ||
                                                                `${safeVersionNumber}-${index}`
                                                            }
                                                        >

                                                            <div className="sf-version-main">

                                                                <div className="sf-version-number-box">
                                                                    <Icon
                                                                        name="history"
                                                                        size={15}
                                                                    />
                                                                </div>

                                                                <div className="sf-version-info">

                                                                    <div className="sf-version-title">

                                                                        Version{" "}
                                                                        {
                                                                            safeVersionNumber
                                                                        }

                                                                        {isCurrent && (
                                                                            <span className="sf-current-version">
                                                                                Current
                                                                            </span>
                                                                        )}

                                                                    </div>

                                                                    <div className="sf-version-meta">

                                                                        {versionDate &&
                                                                            formatDateTime(
                                                                                versionDate
                                                                            )}

                                                                        {versionSize !==
                                                                            null &&
                                                                            versionSize !==
                                                                                undefined && (
                                                                                <>
                                                                                    <span className="sf-version-dot" />

                                                                                    {formatSize(
                                                                                        versionSize
                                                                                    )}
                                                                                </>
                                                                            )}

                                                                    </div>

                                                                </div>

                                                            </div>

                                                            <div className="sf-version-actions">

                                                                <button
                                                                    type="button"
                                                                    className="sf-version-action-button"
                                                                    onClick={() =>
                                                                        handleDownloadVersion(
                                                                            modal.file,
                                                                            versionItem
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        downloadBusy ||
                                                                        restoreBusy
                                                                    }
                                                                >
                                                                    <Icon
                                                                        name="download"
                                                                        size={13}
                                                                    />

                                                                    {downloadBusy
                                                                        ? "Downloading..."
                                                                        : "Download"}

                                                                </button>

                                                                {!isCurrent && (
                                                                    <button
                                                                        type="button"
                                                                        className="sf-version-restore-button"
                                                                        onClick={() =>
                                                                            handleRestoreVersion(
                                                                                modal.file,
                                                                                versionItem
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            restoreBusy ||
                                                                            downloadBusy
                                                                        }
                                                                    >
                                                                        <Icon
                                                                            name="refresh"
                                                                            size={13}
                                                                        />

                                                                        {restoreBusy
                                                                            ? "Restoring..."
                                                                            : "Restore"}

                                                                    </button>
                                                                )}

                                                            </div>

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </div>

                                <div className="sf-modal-footer">

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-secondary"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        Close
                                    </button>

                                </div>
                            </>
                        )}

                        {/* =================================================
                            RENAME MODAL
                        ================================================= */}

                        {modal.type ===
                            "rename" && (
                            <>
                                <div className="sf-modal-header">

                                    <div className="sf-modal-title">
                                        Rename file
                                    </div>

                                    <button
                                        type="button"
                                        className="sf-modal-close"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        <Icon
                                            name="close"
                                            size={14}
                                        />
                                    </button>

                                </div>

                                <div className="sf-modal-body">

                                    <p className="sf-modal-description">
                                        Choose a new name
                                        for this file.
                                    </p>

                                    <div className="sf-form-group">

                                        <label className="sf-form-label">
                                            File name
                                        </label>

                                        <input
                                            className="sf-form-input"
                                            value={
                                                renameValue
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setRenameValue(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(
                                                e
                                            ) => {
                                                if (
                                                    e.key ===
                                                    "Enter"
                                                ) {
                                                    handleRename();
                                                }
                                            }}
                                            autoFocus
                                        />

                                    </div>

                                </div>

                                <div className="sf-modal-footer">

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-secondary"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-primary"
                                        onClick={
                                            handleRename
                                        }
                                        disabled={
                                            actionLoading ===
                                            `rename-${getFileId(
                                                modal.file
                                            )}`
                                        }
                                    >
                                        {actionLoading ===
                                        `rename-${getFileId(
                                            modal.file
                                        )}`
                                            ? "Saving..."
                                            : "Save changes"}
                                    </button>

                                </div>
                            </>
                        )}

                        {/* =================================================
                            SHARE MODAL
                        ================================================= */}

                        {modal.type ===
                            "share" && (
                            <>
                                <div className="sf-modal-header">

                                    <div className="sf-modal-title">
                                        Share file
                                    </div>

                                    <button
                                        type="button"
                                        className="sf-modal-close"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        <Icon
                                            name="close"
                                            size={14}
                                        />
                                    </button>

                                </div>

                                <div className="sf-modal-body">

                                    <p className="sf-modal-description">
                                        Grant another
                                        user controlled
                                        access to this
                                        file.
                                    </p>

                                    <div className="sf-form-group">

                                        <label className="sf-form-label">
                                            User email
                                        </label>

                                        <input
                                            className="sf-form-input"
                                            type="email"
                                            value={
                                                shareEmail
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setShareEmail(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(
                                                e
                                            ) => {
                                                if (
                                                    e.key ===
                                                    "Enter"
                                                ) {
                                                    handleShare();
                                                }
                                            }}
                                            placeholder="name@company.com"
                                            autoFocus
                                        />

                                    </div>

                                    <div className="sf-form-group">

                                        <label className="sf-form-label">
                                            Permission
                                        </label>

                                        <select
                                            className="sf-form-select"
                                            value={
                                                sharePermission
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setSharePermission(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="read">
                                                Read only
                                            </option>

                                            <option value="write">
                                                Read & write
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                <div className="sf-modal-footer">

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-secondary"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-primary"
                                        onClick={
                                            handleShare
                                        }
                                        disabled={
                                            actionLoading ===
                                            `share-${getFileId(
                                                modal.file
                                            )}`
                                        }
                                    >
                                        {actionLoading ===
                                        `share-${getFileId(
                                            modal.file
                                        )}`
                                            ? "Sharing..."
                                            : "Share file"}
                                    </button>

                                </div>
                            </>
                        )}

                        {/* =================================================
                            DELETE MODAL
                        ================================================= */}

                        {modal.type ===
                            "delete" && (
                            <>
                                <div className="sf-modal-header">

                                    <div className="sf-modal-title">
                                        Delete file
                                    </div>

                                    <button
                                        type="button"
                                        className="sf-modal-close"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        <Icon
                                            name="close"
                                            size={14}
                                        />
                                    </button>

                                </div>

                                <div className="sf-modal-body">

                                    <div className="sf-delete-icon">
                                        <Icon
                                            name="trash"
                                            size={18}
                                        />
                                    </div>

                                    <div className="sf-delete-file">
                                        {modal.file
                                            ? getFileName(
                                                  modal.file
                                              )
                                            : "Selected file"}
                                    </div>

                                    <p className="sf-modal-description">
                                        This action will
                                        permanently remove
                                        the file from your
                                        workspace. This
                                        cannot be undone.
                                    </p>

                                </div>

                                <div className="sf-modal-footer">

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-secondary"
                                        onClick={() =>
                                            setModal(
                                                null
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="sf-btn sf-btn-danger"
                                        onClick={
                                            handleDelete
                                        }
                                        disabled={
                                            actionLoading ===
                                            `delete-${getFileId(
                                                modal.file
                                            )}`
                                        }
                                    >
                                        {actionLoading ===
                                        `delete-${getFileId(
                                            modal.file
                                        )}`
                                            ? "Deleting..."
                                            : "Delete permanently"}
                                    </button>

                                </div>
                            </>
                        )}

                    </div>

                </div>
            )}

            {/* =====================================================
                TOAST
            ===================================================== */}

            {toast && (
                <div
                    className={`sf-toast ${
                        toast.type ===
                        "error"
                            ? "error"
                            : ""
                    }`}
                >

                    <div className="sf-toast-icon">

                        <Icon
                            name={
                                toast.type ===
                                "error"
                                    ? "alert"
                                    : "check"
                            }
                            size={13}
                        />

                    </div>

                    <span>
                        {toast.message}
                    </span>

                </div>
            )}

        </div>
    );
}