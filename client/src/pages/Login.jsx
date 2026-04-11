import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Field, FieldLabel, FieldDescription } from "../components/ui/field";
import { Input } from "../components/ui/input";
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
            <Badge variant="success">Wellness Tracker</Badge>
            <Badge variant="info">Secure Access</Badge>
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

            <Field className="section-field">
              <FieldLabel>Email Address</FieldLabel>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="dashboard-input-modern"
                nativeInput
              />
              <FieldDescription>
                Use the email associated with your account.
              </FieldDescription>
            </Field>

            <Field className="section-field">
              <FieldLabel>Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="dashboard-input-modern"
                nativeInput
              />
              <FieldDescription>
                Keep your account secure with a strong password.
              </FieldDescription>
            </Field>

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

            <Button type="submit" loading={loading} disabled={loading}>
              Sign In
            </Button>
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