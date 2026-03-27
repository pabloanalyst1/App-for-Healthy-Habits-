import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Set up your profile and begin tracking your health goals, daily habits, and personal progress."
      footer={
        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Go to sign in</span>
        </p>
      }
    >
      <div className="auth-badge-row">
        <span className="auth-badge">New Member</span>
        <span className="auth-badge">Health Profile</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthInput
          id="register-name"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
        />

        <AuthInput
          id="register-email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
        />

        <AuthInput
          id="register-password"
          label="Password"
          type="password"
          placeholder="Create a password"
        />

        <div className="register-note">
          <p>
            By creating an account, you will be able to organize your habits,
            personalize your profile, and manage your weekly goals.
          </p>
        </div>

        <AuthButton text="Create Account" />
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
    </AuthCard>
  );
}