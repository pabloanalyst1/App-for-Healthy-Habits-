import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

const defaultProfile = {
  fullName: "",
  email: "",
  weight: "",
  height: "",
  goal: "",
  username: "",
  profilePhoto: "",
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("healthyHabitsProfile");
    const savedTime = localStorage.getItem("healthyHabitsProfileSavedAt");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    if (savedTime) {
      setLastUpdated(savedTime);
    }
  }, []);

  const handleChange = (event) => {
    const { id, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        profilePhoto: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const profileToSave = {
      ...profile,
      username:
        profile.username?.trim() ||
        profile.fullName?.trim().toLowerCase().replace(/\s+/g, ".") ||
        "healthy.user",
    };

    localStorage.setItem("healthyHabitsProfile", JSON.stringify(profileToSave));

    const currentTime = new Date().toLocaleString();
    localStorage.setItem("healthyHabitsProfileSavedAt", currentTime);

    setProfile(profileToSave);
    setLastUpdated(currentTime);
    setMessage("Profile updated successfully.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const displayName = profile.fullName?.trim() || "Your Name";
  const displayUsername = profile.username?.trim()
    ? `@${profile.username.trim().replace(/^@/, "")}`
    : profile.fullName?.trim()
      ? `@${profile.fullName.trim().toLowerCase().replace(/\s+/g, ".")}`
      : "@healthy.user";

  return (
    <div className="section-page">
      <div className="section-container">
        <div className="section-top-bar premium-profile-topbar">
          <div>
            <p className="topbar-kicker">Account Settings</p>
            <h1>Profile Settings</h1>
            <p>Manage your personal information, health metrics, and account identity.</p>
          </div>

          <button className="secondary-button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="profile-premium-layout">
          <Card className="profile-identity-card premium-card">
            <CardContent>
              <div className="profile-photo-wrapper">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="profile-photo-preview"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="profile-identity-content">
                <h2>{displayName}</h2>
                <p className="profile-username">{displayUsername}</p>
                <span className="profile-badge">Healthy Habits Member</span>

                <div className="profile-meta-grid">
                  <div className="profile-meta-item">
                    <span>Email</span>
                    <strong>{profile.email || "Add your email"}</strong>
                  </div>

                  <div className="profile-meta-item">
                    <span>Weight</span>
                    <strong>{profile.weight ? `${profile.weight} kg` : "Not set"}</strong>
                  </div>

                  <div className="profile-meta-item">
                    <span>Height</span>
                    <strong>{profile.height ? `${profile.height} cm` : "Not set"}</strong>
                  </div>

                  <div className="profile-meta-item">
                    <span>Last Updated</span>
                    <strong>{lastUpdated || "Not updated yet"}</strong>
                  </div>
                </div>

                <div className="profile-goal-banner">
                  <span>Current Goal</span>
                  <strong>{profile.goal || "Set your personal health goal"}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="form-card premium-card profile-form-card">
            <CardHeader className="panel-header">
              <div>
                <CardTitle>Edit Profile Details</CardTitle>
                <CardDescription className="profile-form-description">
                  Update your personal details, profile identity, and health preferences.
                </CardDescription>
              </div>
              <span className="tag">Personal Settings</span>
            </CardHeader>

            <CardContent>
              <form className="section-form" onSubmit={handleSubmit}>
                <div className="profile-upload-section">
                  <div className="section-field">
                    <label htmlFor="profilePhoto">Profile Photo</label>
                    <input
                      id="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </div>

                  <div className="section-field">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      placeholder="Example: mario.astonitas"
                      value={profile.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="section-field">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={profile.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="section-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={profile.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="section-field">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Example: 67.5"
                      value={profile.weight}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="section-field">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="Example: 165.5"
                      value={profile.height}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="section-field">
                  <label htmlFor="goal">Personal Goal</label>
                  <input
                    id="goal"
                    type="text"
                    placeholder="Example: Improve consistency, stamina, and overall health"
                    value={profile.goal}
                    onChange={handleChange}
                  />
                </div>

                <div className="button-row">
                  <button className="primary-button" type="submit">
                    Save Profile
                  </button>
                </div>

                {message && <p className="success-message">{message}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}