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

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authService.register(formData.email, formData.password);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (registerError) {
      console.log("Registration error:", registerError);
      setError(registerError.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card auth-card-premium">
        <CardHeader className="auth-header auth-header-premium">
          <CardTitle className="auth-title">Create Your Account</CardTitle>
          <CardDescription className="auth-subtitle">
            Set up your profile and begin tracking your health goals, daily
            habits, and personal progress.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="auth-badge-row">
            <span className="auth-badge">New Member</span>
            <span className="auth-badge">Health Profile</span>
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

            {success && (
              <div
                className="success-message"
                style={{ color: "green", marginBottom: "10px" }}
              >
                {success}
              </div>
            )}

            <AuthInput
              id="register-name"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <AuthInput
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <AuthInput
              id="register-password"
              label="Password"
              type="password"
              placeholder="Create a password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="register-note">
              <p>
                By creating an account, you will be able to organize your
                habits, personalize your profile, and manage your weekly goals.
              </p>
            </div>

            <AuthButton
              text={loading ? "Creating account..." : "Create Account"}
              disabled={loading}
            />
          </form>

          <div className="auth-info-panel">
            <div className="auth-info-item">
              <span>Setup</span>
              <strong>Personal account and health profile</strong>
            </div>

            <div className="auth-info-item">
              <span>Status</span>
              <strong>Ready for authentication integration</strong>
            </div>
          </div>
        </CardContent>

        <CardFooter className="auth-footer auth-footer-premium">
          <p>
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Go to sign in</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}