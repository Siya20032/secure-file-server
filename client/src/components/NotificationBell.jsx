import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationBell() {

    const navigate = useNavigate();

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // GET NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async () => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }


            const response =
                await fetch(
                    "http://http://localhost:5000/api/notifications",
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

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            if (!response.ok) {

                console.error(
                    data.message ||
                    "Failed to load notifications"
                );

                return;
            }


            setNotifications(
                data.notifications || []
            );

            setUnreadCount(
                data.unreadCount || 0
            );

        } catch (error) {

            console.error(
                "Notification error:",
                error
            );
        }
    };


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    useEffect(() => {

        fetchNotifications();

        // Check for new notifications
        // every 10 seconds

        const interval =
            setInterval(
                fetchNotifications,
                10000
            );

        return () =>
            clearInterval(interval);

    }, []);


    // ==========================================
    // MARK ONE AS READ
    // ==========================================

    const markAsRead = async (
        notificationId
    ) => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }


            const response =
                await fetch(
                    `http://http://localhost:5000/api/notifications/${notificationId}/read`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {
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

        } catch (error) {

            console.error(
                "Mark notification error:",
                error
            );
        }
    };


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const markAllAsRead = async () => {

        if (unreadCount === 0) {
            return;
        }


        try {

            setLoading(true);

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    "http://http://localhost:5000/api/notifications/read-all",
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {
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

        } catch (error) {

            console.error(
                "Mark all notifications error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // DELETE NOTIFICATION
    // ==========================================

    const deleteNotification = async (
        notificationId
    ) => {

        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `http://http://localhost:5000/api/notifications/${notificationId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {
                return;
            }


            const deletedNotification =
                notifications.find(
                    notification =>
                        notification._id ===
                        notificationId
                );


            setNotifications(
                previous =>
                    previous.filter(
                        notification =>
                            notification._id !==
                            notificationId
                    )
            );


            if (
                deletedNotification &&
                !deletedNotification.isRead
            ) {

                setUnreadCount(
                    previous =>
                        Math.max(
                            previous - 1,
                            0
                        )
                );
            }

        } catch (error) {

            console.error(
                "Delete notification error:",
                error
            );
        }
    };


    // ==========================================
    // NOTIFICATION ICON
    // ==========================================

    const getNotificationIcon = (
        type
    ) => {

        if (type === "SHARE") {
            return "🔗";
        }

        if (
            type ===
            "PERMISSION_CHANGE"
        ) {
            return "🔐";
        }

        if (type === "UNSHARE") {
            return "🚫";
        }

        return "ℹ️";
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "";
        }

        return new Date(
            date
        ).toLocaleString();
    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="relative">

            {/* ==================================
                BELL BUTTON
            ================================== */}

            <button
                onClick={() =>
                    setShowNotifications(
                        previous =>
                            !previous
                    )
                }
                className="relative w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 transition shadow-sm"
            >

                <span className="text-xl">
                    🔔
                </span>


                {/* UNREAD BADGE */}

                {unreadCount > 0 && (

                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">

                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}

                    </span>

                )}

            </button>


            {/* ==================================
                NOTIFICATION DROPDOWN
            ================================== */}

            {showNotifications && (

                <div className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">

                    {/* HEADER */}

                    <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">

                        <div>

                            <h3 className="font-bold text-slate-800">
                                Notifications
                            </h3>

                            <p className="text-xs text-slate-400 mt-1">

                                {unreadCount}
                                {" "}
                                unread

                            </p>

                        </div>


                        {unreadCount > 0 && (

                            <button
                                onClick={
                                    markAllAsRead
                                }
                                disabled={loading}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                                Mark all read
                            </button>

                        )}

                    </div>


                    {/* NOTIFICATIONS */}

                    <div className="max-h-96 overflow-y-auto">

                        {notifications.length ===
                        0 ? (

                            <div className="p-10 text-center">

                                <div className="text-4xl mb-3">
                                    🔔
                                </div>

                                <p className="font-semibold text-slate-600">
                                    No notifications
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    You're all caught up!
                                </p>

                            </div>

                        ) : (

                            notifications.map(
                                notification => (

                                    <div
                                        key={
                                            notification._id
                                        }
                                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition ${
                                            !notification.isRead
                                                ? "bg-blue-50/50"
                                                : ""
                                        }`}
                                    >

                                        <div className="flex gap-3">

                                            {/* ICON */}

                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0">

                                                {
                                                    getNotificationIcon(
                                                        notification.type
                                                    )
                                                }

                                            </div>


                                            {/* CONTENT */}

                                            <div className="flex-1 min-w-0">

                                                <p className={`text-sm ${
                                                    !notification.isRead
                                                        ? "font-semibold text-slate-800"
                                                        : "text-slate-600"
                                                }`}>

                                                    {
                                                        notification.message
                                                    }

                                                </p>


                                                {notification.file && (

                                                    <p className="text-xs text-slate-400 mt-1 truncate">

                                                        📄{" "}

                                                        {
                                                            notification
                                                                .file
                                                                .originalName
                                                        }

                                                    </p>

                                                )}


                                                <p className="text-xs text-slate-400 mt-2">

                                                    {
                                                        formatDate(
                                                            notification.createdAt
                                                        )
                                                    }

                                                </p>


                                                {/* ACTIONS */}

                                                <div className="flex gap-3 mt-2">

                                                    {!notification.isRead && (

                                                        <button
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification._id
                                                                )
                                                            }
                                                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
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
                                                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>


                                            {/* UNREAD DOT */}

                                            {!notification.isRead && (

                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0">
                                                </div>

                                            )}

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            )}

        </div>

    );
}

export default NotificationBell;

