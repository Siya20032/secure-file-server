import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Upload() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setMessage("Please select a file");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            setMessage("");

            const response = await fetch(
                "http://localhost:5000/api/files/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Upload failed");
                return;
            }

            setMessage("File uploaded successfully!");
            setFile(null);

        } catch (error) {
            console.error("Upload error:", error);
            setMessage("Unable to connect to server");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Navbar */}
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">

                <h1 className="text-xl font-bold">
                    Secure File Server
                </h1>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
                >
                    Dashboard
                </button>

            </nav>

            {/* Main */}
            <main className="max-w-3xl mx-auto px-6 py-10">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Upload File
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Upload and securely store your files.
                    </p>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <form onSubmit={handleUpload}>

                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Select File
                        </label>

                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-blue-400 transition">

                            <input
                                type="file"
                                onChange={(e) => {
                                    setFile(e.target.files[0]);
                                    setMessage("");
                                }}
                                className="w-full"
                            />

                        </div>

                        {file && (
                            <div className="mt-5 bg-slate-50 rounded-lg p-4">

                                <p className="text-sm text-slate-500">
                                    Selected file
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {file.name}
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400"
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload File"}
                        </button>

                    </form>

                    {message && (
                        <div className="mt-5 text-center">

                            <p
                                className={
                                    message.includes("successfully")
                                        ? "text-green-600 font-medium"
                                        : "text-red-600 font-medium"
                                }
                            >
                                {message}
                            </p>

                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}

export default Upload;