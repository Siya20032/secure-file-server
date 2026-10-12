
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function NotificationBell() {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Automatic popup
    const [popupNotification, setPopupNotification] =
        useState(null);

    const dropdownRef = useRef(null);

    // Socket reference
    const socketRef = useRef(null);


    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = () => {

        return localStorage.getItem("token");

    };


    // =====================================================
    // HANDLE UNAUTHORIZED
    // =====================================================

    const handleUnauthorized = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    // =====================================================
    // GET USER ID
    // =====================================================

    const getUserId = () => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {

            return null;

        }

        try {

            const user =
                JSON.parse(storedUser);

            return user.id || user._id || null;

        } catch (error) {

            console.error(
                "User data error:",
                error
            );

            return null;

        }

    };


    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications = async () => {

        try {

            const token = getToken();

            if (!token) {

                return;

            }

            setLoading(true);

            const response =
                await fetch(
                    "http://localhost:5000/api/notifications",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                handleUnauthorized();

                return;

            }


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to load notifications"
                );

                return;

            }


            const fetchedNotifications =
                data.notifications || [];


            setNotifications(
                fetchedNotifications
            );


            // Calculate unread count
            const unread =
                fetchedNotifications.filter(
                    notification =>
                        !notification.isRead
                ).length;


            setUnreadCount(unread);


        } catch (error) {

            console.error(
                "Fetch notifications error:",
                error
            );

            setMessage(
                "Unable to load notifications"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // SOCKET.IO REAL-TIME CONNECTION
    // =====================================================

    useEffect(() => {

        const token = getToken();
        const userId = getUserId();


        if (!token || !userId) {

            return;

        }


        console.log(
            "Connecting to Socket.IO..."
        );


        // Connect to backend Socket.IO server
        const socket =
            io("http://localhost:5000", {

                // Send JWT during Socket.IO handshake
                auth: {
                    token: token
                },

                transports: [
                    "websocket",
                    "polling"
                ]

            });


        socketRef.current = socket;


        // =================================================
        // SOCKET CONNECTED
        // =================================================

        socket.on(
            "connect",
            () => {

                console.log(
                    "Socket connected:",
                    socket.id
                );


                // Join user's private notification room
                socket.emit(
                    "join-user",
                    userId
                );


                console.log(
                    "Joined notification room:",
                    `user-${userId}`
                );

            }
        );


        // =================================================
        // RECEIVE NEW NOTIFICATION
        // =================================================

        socket.on(
            "new-notification",
            (notification) => {

                console.log(
                    "New real-time notification:",
                    notification
                );


                // Add notification to beginning
                setNotifications(
                    previous => {

                        // Prevent duplicate notification
                        const alreadyExists =
                            previous.some(
                                item =>
                                    item._id ===
                                    notification._id
                            );


                        if (alreadyExists) {

                            return previous;

                        }


                        return [
                            notification,
                            ...previous
                        ];

                    }
                );


                // Increase unread count
                setUnreadCount(
                    previous =>
                        previous + 1
                );


                // Show popup
                setPopupNotification(
                    notification
                );


                // Automatically hide popup
                setTimeout(() => {

                    setPopupNotification(
                        current => {

                            if (
                                current?._id ===
                                notification._id
                            ) {

                                return null;

                            }

                            return current;

                        }
                    );

                }, 6000);

            }
        );


        // =================================================
        // SOCKET ERROR
        // =================================================

        socket.on(
            "connect_error",
            (error) => {

                console.error(
                    "Socket connection error:",
                    error.message
                );

            }
        );


        // =================================================
        // SOCKET DISCONNECTED
        // =================================================

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    "Socket disconnected:",
                    reason
                );

            }
        );


        // =================================================
        // CLEANUP
        // =================================================

        return () => {

            console.log(
                "Closing Socket.IO connection"
            );

            socket.disconnect();

            socketRef.current = null;

        };

    }, [navigate]);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchNotifications();

    }, []);


    // =====================================================
    // LOAD NOTIFICATIONS WHEN DROPDOWN OPENS
    // =====================================================

    useEffect(() => {

        if (showNotifications) {

            fetchNotifications();

        }

    }, [showNotifications]);


    // =====================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleClickOutside =
            (event) => {

                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(
                        event.target
                    )
                ) {

                    setShowNotifications(
                        false
                    );

                }

            };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    const markAsRead =
        async (notificationId) => {

            try {

                const token = getToken();

                if (!token) {

                    navigate("/login");

                    return;

                }


                const response =
                    await fetch(
                        `http://localhost:5000/api/notifications/${notificationId}/read`,
                        {
                            method: "PUT",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (response.status === 401) {

                    handleUnauthorized();

                    return;

                }


                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to mark notification as read"
                    );

                    return;

                }


                setNotifications(
                    previous =>
                        previous.map(
                            notification =>
                                notification._id ===
                                notificationId
                                    ? {
                                        ...notification,
                                        isRead: true
                                    }
                                    : notification
                        )
                );


                setUnreadCount(
                    previous =>
                        Math.max(
                            previous - 1,
                            0
                        )
                );


                if (
                    popupNotification &&
                    popupNotification._id ===
                    notificationId
                ) {

                    setPopupNotification(
                        null
                    );

                }


            } catch (error) {

                console.error(
                    "Mark notification read error:",
                    error
                );

            }

        };


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const markAllAsRead = async () => {

        try {

            const token = getToken();

            if (!token) {

                navigate("/login");

                return;

            }


            const response =
                await fetch(
                    "http://localhost:5000/api/notifications/read-all",
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                handleUnauthorized();

                return;

            }


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to mark notifications as read"
                );

                return;

            }


            setNotifications(
                previous =>
                    previous.map(
                        notification => ({
                            ...notification,
                            isRead: true
                        })
                    )
            );


            setUnreadCount(0);

            setPopupNotification(null);


        } catch (error) {

            console.error(
                "Mark all notifications error:",
                error
            );

        }

    };


    // =====================================================
    // DELETE NOTIFICATION
    // =====================================================

    const deleteNotification =
        async (notificationId) => {

            try {

                const token = getToken();

                if (!token) {

                    navigate("/login");

                    return;

                }


                const notification =
                    notifications.find(
                        item =>
                            item._id ===
                            notificationId
                    );


                const response =
                    await fetch(
                        `http://localhost:5000/api/notifications/${notificationId}`,
                        {
                            method: "DELETE",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (response.status === 401) {

                    handleUnauthorized();

                    return;

                }


                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to delete notification"
                    );

                    return;

                }


                setNotifications(
                    previous =>
                        previous.filter(
                            item =>
                                item._id !==
                                notificationId
                        )
                );


                if (
                    notification &&
                    !notification.isRead
                ) {

                    setUnreadCount(
                        previous =>
                            Math.max(
                                previous - 1,
                                0
                            )
                    );

                }


                if (
                    popupNotification &&
                    popupNotification._id ===
                    notificationId
                ) {

                    setPopupNotification(
                        null
                    );

                }


            } catch (error) {

                console.error(
                    "Delete notification error:",
                    error
                );

            }

        };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {

            return "";

        }


        return new Date(
            date
        ).toLocaleString(
            [],
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    };


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon =
        (type) => {

            switch (type) {

                case "SHARE":
                    return "🔗";

                case "UNSHARE":
                    return "🚫";

                case "PERMISSION_CHANGE":
                    return "🔐";

                default:
                    return "🔔";

            }

        };


    // =====================================================
    // TOGGLE
    // =====================================================

    const toggleNotifications = () => {

        setShowNotifications(
            previous => !previous
        );

        setMessage("");

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <>

            {/* =================================================
                REAL-TIME POPUP
            ================================================= */}

            {popupNotification && (

                <div className="fixed top-6 right-6 z-[9999] w-[380px] max-w-[90vw]">

                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                        {/* TOP */}

                        <div className="bg-blue-600 px-5 py-4 text-white flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">

                                    {getNotificationIcon(
                                        popupNotification.type
                                    )}

                                </div>

                                <div>

                                    <p className="font-bold">
                                        New Notification
                                    </p>

                                    <p className="text-xs text-blue-100">
                                        Secure Files
                                    </p>

                                </div>

                            </div>


                            <button
                                onClick={() =>
                                    setPopupNotification(
                                        null
                                    )
                                }
                                className="text-white text-xl hover:text-blue-100"
                            >

                                ×

                            </button>

                        </div>


                        {/* MESSAGE */}

                        <div className="px-5 py-4">

                            <p className="text-sm font-semibold text-slate-800">

                                {
                                    popupNotification.message
                                }

                            </p>


                            {popupNotification.file && (

                                <p className="text-xs text-slate-500 mt-2">

                                    📄{" "}

                                    {
                                        popupNotification
                                            .file
                                            .originalName
                                    }

                                </p>

                            )}


                            <p className="text-xs text-slate-400 mt-2">

                                {formatDate(
                                    popupNotification.createdAt
                                )}

                            </p>


                            <div className="flex gap-3 mt-4">

                                <button
                                    onClick={() => {

                                        markAsRead(
                                            popupNotification._id
                                        );

                                        setShowNotifications(
                                            true
                                        );

                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                                >

                                    View

                                </button>


                                <button
                                    onClick={() =>
                                        setPopupNotification(
                                            null
                                        )
                                    }
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200"
                                >

                                    Later

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                BELL + DROPDOWN
            ================================================= */}

            <div
                ref={dropdownRef}
                className="relative"
            >

                {/* BELL */}

                <button
                    onClick={toggleNotifications}
                    className="relative w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xl hover:bg-slate-50 transition shadow-sm"
                    title="Notifications"
                >

                    🔔


                    {unreadCount > 0 && (

                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">

                            {unreadCount > 99
                                ? "99+"
                                : unreadCount}

                        </span>

                    )}

                </button>


                {/* =================================================
                    DROPDOWN
                ================================================= */}

                {showNotifications && (

                    <div className="absolute right-0 top-14 w-[380px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">

                        {/* HEADER */}

                        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

                            <div>

                                <h3 className="font-bold text-slate-800 text-lg">

                                    Notifications

                                </h3>

                                <p className="text-xs text-slate-400 mt-1">

                                    {unreadCount} unread

                                </p>

                            </div>


                            {unreadCount > 0 && (

                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >

                                    Mark all read

                                </button>

                            )}

                        </div>


                        {/* ERROR */}

                        {message && (

                            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">

                                {message}

                            </div>

                        )}


                        {/* CONTENT */}

                        {loading ? (

                            <div className="p-8 text-center">

                                <div className="text-3xl mb-2">
                                    ⏳
                                </div>

                                <p className="text-slate-500 text-sm">
                                    Loading notifications...
                                </p>

                            </div>

                        ) : notifications.length === 0 ? (

                            <div className="p-10 text-center">

                                <div className="text-4xl mb-3">
                                    🔕
                                </div>

                                <p className="font-semibold text-slate-600">
                                    No notifications
                                </p>

                                <p className="text-sm text-slate-400 mt-1">
                                    You're all caught up!
                                </p>

                            </div>

                        ) : (

                            <div className="max-h-[420px] overflow-y-auto">

                                {notifications.map(
                                    notification => (

                                        <div
                                            key={
                                                notification._id
                                            }
                                            className={`px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition ${
                                                !notification.isRead
                                                    ? "bg-blue-50/60"
                                                    : "bg-white"
                                            }`}
                                        >

                                            <div className="flex gap-3">

                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0">

                                                    {getNotificationIcon(
                                                        notification.type
                                                    )}

                                                </div>


                                                <div className="flex-1 min-w-0">

                                                    <div className="flex items-start justify-between gap-2">

                                                        <p
                                                            className={`text-sm ${
                                                                !notification.isRead
                                                                    ? "font-semibold text-slate-800"
                                                                    : "font-medium text-slate-600"
                                                            }`}
                                                        >

                                                            {
                                                                notification.message
                                                            }

                                                        </p>


                                                        {!notification.isRead && (

                                                            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5">
                                                            </span>

                                                        )}

                                                    </div>


                                                    {notification.file && (

                                                        <p className="text-xs text-slate-400 mt-1">

                                                            📄{" "}

                                                            {
                                                                notification
                                                                    .file
                                                                    .originalName
                                                            }

                                                        </p>

                                                    )}


                                                    <p className="text-xs text-slate-400 mt-2">

                                                        {formatDate(
                                                            notification.createdAt
                                                        )}

                                                    </p>


                                                    <div className="flex gap-3 mt-2">

                                                        {!notification.isRead && (

                                                            <button
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification._id
                                                                    )
                                                                }
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                            >

                                                                Mark as read

                                                            </button>

                                                        )}


                                                        <button
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification._id
                                                                )
                                                            }
                                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                        >

                                                            Delete

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}


                        {/* FOOTER */}

                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">

                            <button
                                onClick={() =>
                                    setShowNotifications(
                                        false
                                    )
                                }
                                className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium"
                            >

                                Close

                            </button>

                        </div>

                    </div>

                )}

            </div>

        </>

    );

}

export default NotificationBell;

