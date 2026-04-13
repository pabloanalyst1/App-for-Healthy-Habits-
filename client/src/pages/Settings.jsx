import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";
import authService from "../services/authService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Field, FieldLabel, FieldDescription } from "../components/ui/field";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "../components/ui/select";
import "../styles/auth.css";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    preferences: {
      darkMode: false,
      notifications: true,
      language: "en",
    },
  });
  const [formData, setFormData] = useState({
    name: "",
    preferences: {
      darkMode: false,
      notifications: true,
      language: "en",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || "",
        preferences: data.preferences || {
          darkMode: false,
          notifications: true,
          language: "en",
        },
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePreferenceChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await userService.updateProfile(formData.name, formData.preferences);

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);

      await loadProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <div className="section-container">
        <div className="section-top-bar premium-top-bar">
          <div>
            <p className="topbar-kicker">Preferences</p>
            <h1>Settings</h1>
            <p className="topbar-description">
              Manage your profile settings and personal preferences.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <Card className="form-card premium-card settings-form-card">
          <CardHeader className="panel-header">
            <div>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription className="settings-card-description">
                Update your name, language, notifications, and display preferences.
              </CardDescription>
            </div>
            <Badge variant="info">User Settings</Badge>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="feedback-banner feedback-error">
                {error}
              </div>
            )}

            {success && (
              <div className="feedback-banner feedback-success">
                {success}
              </div>
            )}

            <form className="section-form" onSubmit={handleSubmit}>
              <Field className="section-field">
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="dashboard-input-modern settings-disabled-input"
                  nativeInput
                />
                <FieldDescription>
                  Email cannot be changed from this screen.
                </FieldDescription>
              </Field>

              <Field className="section-field">
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="dashboard-input-modern"
                  nativeInput
                />
                <FieldDescription>
                  This name will be used in your account profile.
                </FieldDescription>
              </Field>

              <div className="settings-preferences-block">
                <div className="settings-preferences-header">
                  <h3>Preferences</h3>
                  <p>Customize the way your account behaves.</p>
                </div>

                <div className="settings-toggle-grid">
                  <label className="settings-toggle-card">
                    <div>
                      <strong>Enable Dark Mode</strong>
                      <p>Switch to a darker visual appearance.</p>
                    </div>
                    <input
                      type="checkbox"
                      name="darkMode"
                      checked={formData.preferences.darkMode}
                      onChange={handlePreferenceChange}
                    />
                  </label>

                  <label className="settings-toggle-card">
                    <div>
                      <strong>Enable Notifications</strong>
                      <p>Receive updates and reminders.</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.preferences.notifications}
                      onChange={handlePreferenceChange}
                    />
                  </label>
                </div>

                <Field className="section-field">
                  <FieldLabel>Language</FieldLabel>
                  <Select
                    value={formData.preferences.language}
                    onValueChange={(value) =>
                      handlePreferenceChange({
                        target: {
                          name: "language",
                          value,
                          type: "select-one",
                        },
                      })
                    }
                  >
                    <SelectTrigger className="dashboard-select-modern">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectPopup>
                  </Select>
                  <FieldDescription>
                    Choose the language you prefer for your account experience.
                  </FieldDescription>
                </Field>
              </div>

              <div className="button-row">
                <Button type="submit" loading={saving} disabled={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}