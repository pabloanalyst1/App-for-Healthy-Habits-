import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import authService from "../services/authService";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authService.register(formData.email, formData.password);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.log("Registration error:", error);
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Start tracking your habits and improving your daily health."
      footer={
        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

        <AuthInput
          id="register-email"
          label="Email"
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

        <AuthButton text={loading ? "Creating account..." : "Register"} disabled={loading} />
      </form>
    </AuthCard>
  );
}