import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
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
        <AuthInput
          id="register-name"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
        />

        <AuthInput
          id="register-email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <AuthInput
          id="register-password"
          label="Password"
          type="password"
          placeholder="Create a password"
        />

        <AuthButton text="Register" />
      </form>
    </AuthCard>
  );
}