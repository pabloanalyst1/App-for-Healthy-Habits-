import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <AuthCard
      title="Healthy Habits"
      subtitle="Sign in to manage your goals, review your progress, and continue building a healthier routine."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <span onClick={() => navigate("/register")}>Create one here</span>
        </p>
      }
    >
      <div className="auth-badge-row">
        <span className="auth-badge">Wellness Tracker</span>
        <span className="auth-badge">Secure Access</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthInput
          id="login-email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
        />

        <AuthInput
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <div className="auth-options premium-auth-options">
          <label className="remember-me">
            <input type="checkbox" />
            Keep me signed in
          </label>

          <button
            type="button"
            className="auth-text-button"
            onClick={() => alert("Password recovery flow can be connected later.")}
          >
            Forgot password?
          </button>
        </div>

        <AuthButton text="Sign In" />
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
    </AuthCard>
  );
}