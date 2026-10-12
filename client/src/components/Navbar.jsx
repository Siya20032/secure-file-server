import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav>
            <h2>Secure File Server</h2>

            <div>
                <Link to="/dashboard">Dashboard</Link>{" "}
                <Link to="/my-files">My Files</Link>{" "}
                <Link to="/shared-files">Shared Files</Link>{" "}
                <Link to="/profile">Profile</Link>{" "}

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;

