import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");


    // ==========================================
    // GET ADMIN DASHBOARD DATA
    // ==========================================

    const fetchDashboard = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const storedUser =
                localStorage.getItem("user");


            if (!token || !storedUser) {

                navigate("/login");

                return;
            }


            const user =
                JSON.parse(storedUser);


            // Check admin

            if (user.role !== "admin") {

                navigate("/dashboard");

                return;
            }


            const response =
                await fetch(
                    "http://http://localhost:5000/api/admin/dashboard",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            if (response.status === 403) {

                navigate("/dashboard");

                return;
            }


            if (!response.ok) {

                setMessage(
                    result.message ||
                    "Failed to load admin dashboard"
                );

                return;
            }


            setData(result);

        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // GET ALL ADMIN FILES
    // ==========================================

    const fetchFiles = async () => {

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;
            }


            const response =
                await fetch(
                    "http://http://localhost:5000/api/admin/files",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            if (response.status === 403) {

                navigate("/dashboard");

                return;
            }


            if (!response.ok) {

                setMessage(
                    result.message ||
                    "Failed to load files"
                );

                return;
            }


            setFiles(
                result.files || []
            );

        } catch (error) {

            console.error(
                "Admin files error:",
                error
            );

            setMessage(
                "Unable to load files"
            );
        }
    };


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {

        fetchDashboard();
        fetchFiles();

    }, []);


    // ==========================================
    // CHANGE USER ROLE
    // ==========================================

    const handleRoleChange =
        async (userId, newRole) => {

        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `http://http://localhost:5000/api/admin/users/${userId}/role`,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            role: newRole
                        })
                    }
                );


            const result =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            if (!response.ok) {

                setMessage(
                    result.message ||
                    "Failed to change role"
                );

                return;
            }


            setMessage(
                "User role updated successfully!"
            );


            await fetchDashboard();

        } catch (error) {

            console.error(
                "Role change error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        }
    };


    // ==========================================
    // DELETE USER
    // ==========================================

    const handleDeleteUser =
        async (userId) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this user?"
            );


        if (!confirmDelete) {

            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;
            }


            const response =
                await fetch(
                    `http://http://localhost:5000/api/admin/users/${userId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            if (!response.ok) {

                setMessage(
                    result.message ||
                    "Failed to delete user"
                );

                return;
            }


            setMessage(
                "User and their files deleted successfully!"
            );


            await fetchDashboard();
            await fetchFiles();

        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        }
    };


    // ==========================================
    // DELETE FILE
    // ==========================================

    const handleDeleteFile =
        async (fileId) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this file?"
            );


        if (!confirmDelete) {

            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;
            }


            const response =
                await fetch(
                    `http://http://localhost:5000/api/admin/files/${fileId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                return;
            }


            if (!response.ok) {

                setMessage(
                    result.message ||
                    "Failed to delete file"
                );

                return;
            }


            setMessage(
                "File deleted successfully!"
            );


            await fetchFiles();
            await fetchDashboard();

        } catch (error) {

            console.error(
                "Delete file error:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");
    };


    // ==========================================
    // FORMAT STORAGE
    // ==========================================

    const formatStorage = (bytes) => {

        if (!bytes || bytes === 0) {

            return "0 B";
        }


        if (bytes < 1024) {

            return `${bytes} B`;
        }


        if (bytes < 1024 * 1024) {

            return `${(
                bytes / 1024
            ).toFixed(2)} KB`;
        }


        if (bytes < 1024 * 1024 * 1024) {

            return `${(
                bytes /
                (1024 * 1024)
            ).toFixed(2)} MB`;
        }


        return `${(
            bytes /
            (1024 * 1024 * 1024)
        ).toFixed(2)} GB`;
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-4xl mb-4">
                        ⏳
                    </div>

                    <p className="text-slate-600">
                        Loading admin dashboard...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="min-h-screen bg-slate-100 flex">


            {/* ==================================
                SIDEBAR
            ================================== */}

            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 bottom-0">


                {/* LOGO */}

                <div className="px-6 py-6 border-b border-slate-700">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">
                            🔐
                        </div>

                        <div>

                            <h1 className="text-xl font-bold">
                                Secure Files
                            </h1>

                            <p className="text-xs text-slate-400">
                                Admin Panel
                            </p>

                        </div>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="flex-1 px-4 py-6 space-y-2">


                    {/* DASHBOARD */}

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        🏠 Dashboard
                    </button>


                    {/* MY FILES */}

                    <button
                        onClick={() =>
                            navigate("/my-files")
                        }
                        className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        📁 My Files
                    </button>


                    {/* SHARED FILES */}

                    <button
                        onClick={() =>
                            navigate("/shared-files")
                        }
                        className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        🔗 Shared With Me
                    </button>


                    {/* PROFILE */}

                    <button
                        onClick={() =>
                            navigate("/profile")
                        }
                        className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        👤 Profile
                    </button>


                    {/* ADMIN */}

                    <button
                        onClick={() =>
                            navigate("/admin")
                        }
                        className="w-full text-left px-4 py-3 rounded-lg bg-blue-600 text-white"
                    >
                        🛡️ Admin Panel
                    </button>

                </nav>


                {/* LOGOUT */}

                <div className="p-4 border-t border-slate-700">

                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition text-left"
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main className="flex-1 ml-64 p-8">


                {/* HEADER */}

                <div className="flex justify-between items-center mb-8">

                    <div>

                        <h2 className="text-3xl font-bold text-slate-800">
                            Admin Dashboard
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Manage users, files and monitor the system
                        </p>

                    </div>


                    <button
                        onClick={() => {
                            fetchDashboard();
                            fetchFiles();
                        }}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* MESSAGE */}

                {message && (

                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">

                        {message}

                    </div>

                )}


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


                    {/* USERS */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Total Users
                                </p>

                                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                    {data?.totalUsers || 0}
                                </h3>

                            </div>

                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                👥
                            </div>

                        </div>

                    </div>


                    {/* FILES */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Total Files
                                </p>

                                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                    {data?.totalFiles || 0}
                                </h3>

                            </div>

                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                📁
                            </div>

                        </div>

                    </div>


                    {/* STORAGE */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Storage Used
                                </p>

                                <h3 className="text-2xl font-bold text-slate-800 mt-2">
                                    {formatStorage(
                                        data?.storageUsed
                                    )}
                                </h3>

                            </div>

                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                                💾
                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    USERS TABLE
                ================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


                    <div className="p-6 border-b border-slate-200">

                        <h3 className="text-xl font-bold text-slate-800">
                            User Management
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                            Manage registered users and their roles
                        </p>

                    </div>


                    {data?.users?.length === 0 ? (

                        <div className="p-12 text-center">

                            <div className="text-4xl mb-3">
                                👥
                            </div>

                            <p className="text-slate-500">
                                No users found
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            User
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Email
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Role
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Created
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {data?.users?.map(
                                        (user) => (

                                            <tr
                                                key={
                                                    user._id
                                                }
                                                className="border-t border-slate-200 hover:bg-slate-50"
                                            >


                                                {/* USER */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            👤
                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-slate-700">
                                                                {
                                                                    user.name
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td className="px-6 py-5 text-sm text-slate-600">

                                                    {
                                                        user.email
                                                    }

                                                </td>


                                                {/* ROLE */}

                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            user.role === "admin"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}
                                                    >

                                                        {
                                                            user.role
                                                        }

                                                    </span>

                                                </td>


                                                {/* CREATED */}

                                                <td className="px-6 py-5 text-sm text-slate-500">

                                                    {user.createdAt
                                                        ? new Date(
                                                            user.createdAt
                                                        ).toLocaleDateString()
                                                        : "N/A"}

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <select
                                                            value={
                                                                user.role
                                                            }
                                                            onChange={(e) =>
                                                                handleRoleChange(
                                                                    user._id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >

                                                            <option value="user">
                                                                User
                                                            </option>

                                                            <option value="admin">
                                                                Admin
                                                            </option>

                                                        </select>


                                                        <button
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    user._id
                                                                )
                                                            }
                                                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* ==================================
                    FILE MANAGEMENT
                ================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">


                    <div className="p-6 border-b border-slate-200">

                        <h3 className="text-xl font-bold text-slate-800">
                            File Management
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                            View and manage all uploaded files
                        </p>

                    </div>


                    {files.length === 0 ? (

                        <div className="p-12 text-center">

                            <div className="text-4xl mb-3">
                                📁
                            </div>

                            <p className="text-slate-500">
                                No files found
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            File
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Owner
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Type
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Size
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Uploaded
                                        </th>

                                        <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {files.map(
                                        (file) => (

                                            <tr
                                                key={
                                                    file._id
                                                }
                                                className="border-t border-slate-200 hover:bg-slate-50"
                                            >

                                                {/* FILE */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            📄
                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-slate-700">
                                                                {
                                                                    file.originalName
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* OWNER */}

                                                <td className="px-6 py-5">

                                                    <p className="font-medium text-slate-700">

                                                        {
                                                            file.owner?.name ||
                                                            "Unknown"
                                                        }

                                                    </p>

                                                    <p className="text-xs text-slate-400">

                                                        {
                                                            file.owner?.email ||
                                                            "Unknown"
                                                        }

                                                    </p>

                                                </td>


                                                {/* TYPE */}

                                                <td className="px-6 py-5 text-sm text-slate-600">

                                                    {
                                                        file.mimeType ||
                                                        "Unknown"
                                                    }

                                                </td>


                                                {/* SIZE */}

                                                <td className="px-6 py-5 text-sm text-slate-600">

                                                    {
                                                        formatStorage(
                                                            file.size
                                                        )
                                                    }

                                                </td>


                                                {/* UPLOADED */}

                                                <td className="px-6 py-5 text-sm text-slate-500">

                                                    {file.createdAt
                                                        ? new Date(
                                                            file.createdAt
                                                        ).toLocaleDateString()
                                                        : "N/A"}

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-6 py-5">

                                                    <button
                                                        onClick={() =>
                                                            handleDeleteFile(
                                                                file._id
                                                            )
                                                        }
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


            </main>

        </div>
    );
}

export default AdminDashboard;

