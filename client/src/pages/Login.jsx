import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import authService from "../services/authService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card auth-card-premium">
        <CardHeader className="auth-header auth-header-premium">
          <CardTitle className="auth-title">Healthy Habits</CardTitle>
          <CardDescription className="auth-subtitle">
            Sign in to manage your goals, review your progress, and continue
            building a healthier routine.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="auth-badge-row">
            <span className="auth-badge">Wellness Tracker</span>
            <span className="auth-badge">Secure Access</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div
                className="error-message"
                style={{ color: "red", marginBottom: "10px" }}
              >
                {error}
              </div>
            )}

            <AuthInput
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <AuthInput
              id="login-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="auth-options premium-auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                Keep me signed in
              </label>

              <button
                type="button"
                className="auth-text-button"
                onClick={() =>
                  alert("Password recovery flow can be connected later.")
                }
              >
                Forgot password?
              </button>
            </div>

            <AuthButton
              text={loading ? "Logging in..." : "Sign In"}
              disabled={loading}
            />
          </form>

          <div className="auth-info-panel">
            <div className="auth-info-item">
              <span>Focus</span>
              <strong>Daily goals and healthy routines</strong>
            </div>

            <div className="auth-info-item">
              <span>Access</span>
              <strong>Login prepared for backend integration</strong>
            </div>
          </div>
        </CardContent>

        <CardFooter className="auth-footer auth-footer-premium">
          <p>
            Don&apos;t have an account?{" "}
            <span onClick={() => navigate("/register")}>Create one here</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}