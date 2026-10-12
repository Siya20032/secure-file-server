
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // FileNest backend URL
    const API_URL = (
        import.meta.env.VITE_API_URL ||
        "http://localhost:5001"
    ).replace(/\/+$/, "").replace(/\/api$/, "");

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        console.log("========== LOGIN STARTED ==========");
        console.log("Email:", email);
        console.log("API URL:", API_URL);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            console.log(
                "Login API status:",
                response.status
            );

            const data = await response.json();

            console.log(
                "Login API response:",
                data
            );

            if (!response.ok) {
                console.log("LOGIN FAILED");

                setMessage(
                    data.message || "Login failed"
                );

                return;
            }

            console.log("LOGIN SUCCESS");

            console.log(
                "Token received:",
                data.token
            );

            console.log(
                "User received:",
                data.user
            );

            // Store JWT token
            localStorage.setItem(
                "token",
                data.token
            );

            console.log(
                "Token stored in localStorage:",
                localStorage.getItem("token")
            );

            // Store user information
            if (data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            console.log(
                "User stored:",
                localStorage.getItem("user")
            );

            console.log(
                "Navigating to /dashboard..."
            );

            // Navigate to dashboard
            navigate("/dashboard");

            console.log(
                "navigate('/dashboard') executed"
            );

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error
            );

            setMessage(
                "Unable to connect to server"
            );
        } finally {
            setLoading(false);

            console.log(
                "========== LOGIN FINISHED =========="
            );
        }
    };

    return (
        <main className="login-page">
            <div className="login-shell">

                {/* Left branding and project information panel */}
                <section className="login-visual">

                    <div className="login-brand">
                        <div className="login-brand-mark">
                            F
                        </div>

                        <span>FileNest</span>
                    </div>

                    <div className="login-visual-content">

                        <span className="login-eyebrow">
                            YOUR FILES. YOUR SPACE.
                        </span>

                        <h1>
                            Everything you need,
                            <br />
                            <span>all in one place.</span>
                        </h1>

                        <p className="login-project-description">
                            A secure file management workspace to
                            upload, organize, share, and keep track
                            of your important files.
                        </p>

                        <div className="login-feature">
                            <span className="login-feature-icon">
                                ↗
                            </span>

                            <div>
                                <h3>Easy file management</h3>

                                <p>
                                    Upload and download files from
                                    one organized workspace.
                                </p>
                            </div>
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">
                                ⌁
                            </span>

                            <div>
                                <h3>Sharing and versioning</h3>

                                <p>
                                    Share files and keep track of
                                    their versions.
                                </p>
                            </div>
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">
                                ✓
                            </span>

                            <div>
                                <h3>Protected access</h3>

                                <p>
                                    Sign in to access your personal
                                    file workspace.
                                </p>
                            </div>
                        </div>

                        {/* Decorative shapes */}
                        <div
                            className="login-decoration login-decoration-one"
                            aria-hidden="true"
                        />

                        <div
                            className="login-decoration login-decoration-two"
                            aria-hidden="true"
                        />

                    </div>

                    <div className="login-visual-footer">
                        <span>FileNest</span>
                    </div>

                </section>

                {/* Right login panel */}
                <section className="login-form-panel">

                    <div className="login-form-wrap">

                        <div className="login-mobile-brand">
                            <div className="login-brand-mark">
                                F
                            </div>

                            <span>FileNest</span>
                        </div>

                        <div className="login-heading">

                            <span className="login-welcome">
                                WELCOME BACK
                            </span>

                            <h2>Sign in to your account</h2>

                            <p>
                                Enter your details to access your files.
                            </p>

                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="login-form"
                        >

                            {/* EMAIL */}
                            <div className="login-field">

                                <label htmlFor="login-email">
                                    Email address
                                </label>

                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                            {/* PASSWORD */}
                            <div className="login-field">

                                <label htmlFor="login-password">
                                    Password
                                </label>

                                <div className="login-password-wrap">

                                    <input
                                        id="login-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="login-show-password"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}

                                {!loading && (
                                    <span aria-hidden="true">
                                        →
                                    </span>
                                )}
                            </button>

                        </form>

                        {/* ERROR / SUCCESS MESSAGE */}
                        {message && (
                            <p
                                className="login-message"
                                role="alert"
                            >
                                {message}
                            </p>
                        )}

                        {/* REGISTER */}
                        <div className="login-register">

                            <span>
                                Don’t have an account?
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/register")
                                }
                            >
                                Create account
                            </button>

                        </div>

                        {/* SECURITY NOTE */}
                        <p className="login-security-note">
                            <span aria-hidden="true">
                                🔒
                            </span>

                            Your files are protected by secure authentication.
                        </p>

                    </div>

                </section>

            </div>
        </main>
    );
}

export default Login;