import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
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
        <AuthInput
          id="login-email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <AuthInput
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <div className="auth-options">
          <label className="remember-me">
            <input type="checkbox" />
            Remember me
          </label>
        </div>

        <AuthButton text="Login" />
      </form>
    </AuthCard>
  );
}