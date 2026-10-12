
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5001"
)
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Registration failed");
                return;
            }

            setMessage("Registration successful!");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-shell">
                <section className="login-visual">
                    <div className="login-brand">
                        <div className="login-brand-mark">F</div>
                        <span>FileNest</span>
                    </div>

                    <div className="login-visual-content">
                        <span className="login-eyebrow">
                            YOUR FILES. YOUR SPACE.
                        </span>

                        <h1>
                            Your files,
                            <br />
                            <span>all in one place.</span>
                        </h1>

                        <p className="login-project-description">
                            Create your FileNest account and start
                            organizing, sharing, and keeping track
                            of your important files.
                        </p>

                        <div className="login-feature">
                            <span className="login-feature-icon">↗</span>
                            <div>
                                <h3>Easy file management</h3>
                                <p>
                                    Upload and download files from
                                    one organized workspace.
                                </p>
                            </div>
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">⌁</span>
                            <div>
                                <h3>Sharing and versioning</h3>
                                <p>
                                    Share files and keep track of
                                    their versions.
                                </p>
                            </div>
                        </div>

                        <div className="login-feature">
                            <span className="login-feature-icon">✓</span>
                            <div>
                                <h3>Protected access</h3>
                                <p>
                                    Your personal file workspace
                                    is available after signing in.
                                </p>
                            </div>
                        </div>

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

                <section className="login-form-panel">
                    <div className="login-form-wrap">
                        <div className="login-mobile-brand">
                            <div className="login-brand-mark">F</div>
                            <span>FileNest</span>
                        </div>

                        <div className="login-heading">
                            <span className="login-welcome">
                                GET STARTED
                            </span>

                            <h2>Create your account</h2>

                            <p>
                                Enter your details to create your
                                personal file workspace.
                            </p>
                        </div>

                        <form
                            onSubmit={handleRegister}
                            className="login-form"
                        >
                            <div className="login-field">
                                <label htmlFor="register-name">
                                    Full name
                                </label>

                                <input
                                    id="register-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="register-email">
                                    Email address
                                </label>

                                <input
                                    id="register-email"
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

                            <div className="login-field">
                                <label htmlFor="register-password">
                                    Password
                                </label>

                                <div className="login-password-wrap">
                                    <input
                                        id="register-password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="login-show-password"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}

                                {!loading && (
                                    <span aria-hidden="true">→</span>
                                )}
                            </button>
                        </form>

                        {message && (
                            <p className="login-message" role="alert">
                                {message}
                            </p>
                        )}

                        <div className="login-register">
                            <span>Already have an account?</span>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                Sign in
                            </button>
                        </div>

                        <p className="login-security-note">
                            <span aria-hidden="true">🔒</span>
                            Your files are protected by secure authentication.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Register;
