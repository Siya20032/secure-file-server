
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// AUTH PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// MAIN PAGES
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import SharedWithMe from "./pages/SharedWithMe";
import SharedByMe from "./pages/SharedByMe";

// OTHER PAGES
import FileDetails from "./pages/FileDetails";

import AdminDashboard from "./pages/AdminDashboard";

// PROTECTED ROUTE
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* LANDING PAGE */}
                <Route path="/" element={<Home />} />

                {/* AUTHENTICATION */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* DASHBOARD */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* UPLOAD */}
                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <Upload />
                        </ProtectedRoute>
                    }
                />

                {/* MY FILES */}
                <Route
                    path="/my-files"
                    element={
                        <ProtectedRoute>
                            <MyFiles />
                        </ProtectedRoute>
                    }
                />

                {/* SHARED WITH ME */}
                <Route
                    path="/shared-with-me"
                    element={
                        <ProtectedRoute>
                            <SharedWithMe />
                        </ProtectedRoute>
                    }
                />

                {/* SHARED BY ME */}
<Route
    path="/shared-by-me"
    element={
        <ProtectedRoute>
            <SharedByMe />
        </ProtectedRoute>
    }
/>

                {/* OLD URL SUPPORT */}
                <Route
                    path="/shared-files"
                    element={<Navigate to="/shared-with-me" replace />}
                />

                {/* FILE DETAILS */}
                <Route
                    path="/files/:id"
                    element={
                        <ProtectedRoute>
                            <FileDetails />
                        </ProtectedRoute>
                    }
                />

                
                {/* ADMIN DASHBOARD */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* UNKNOWN ROUTE */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;