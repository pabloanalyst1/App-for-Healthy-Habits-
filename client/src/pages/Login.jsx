import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import authService from "../services/authService";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Healthy Habits"
      subtitle="Welcome back. Log in to continue building your healthy routine."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <AuthInput
          id="login-email"
          label="Email"
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

        <div className="auth-options">
          <label className="remember-me">
            <input type="checkbox" />
            Remember me
          </label>
        </div>

        <AuthButton text={loading ? "Logging in..." : "Login"} disabled={loading} />
      </form>
    </AuthCard>
  );
}