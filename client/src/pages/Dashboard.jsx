import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("healthyHabitsProfile");
    const savedHabits = localStorage.getItem("healthyHabitsList");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  const fullName =
    profile?.fullName && profile.fullName.trim() !== ""
      ? profile.fullName
      : "User";

  const username =
    profile?.username && profile.username.trim() !== ""
      ? `@${profile.username.trim().replace(/^@/, "")}`
      : profile?.fullName && profile.fullName.trim() !== ""
      ? `@${profile.fullName.trim().toLowerCase().replace(/\s+/g, ".")}`
      : "@healthy.user";

  const currentGoal =
    profile?.goal && profile.goal.trim() !== ""
      ? profile.goal
      : "Build stronger daily consistency";

  const totalHabits = habits.length;

  const completedHabits = useMemo(() => {
    return habits.filter((habit) => habit.progress === "Completed").length;
  }, [habits]);

  const activeHabits = useMemo(() => {
    return habits.filter((habit) => habit.progress === "In Progress").length;
  }, [habits]);

  const pendingHabits = useMemo(() => {
    return habits.filter((habit) => habit.progress === "Pending").length;
  }, [habits]);

  const completionRate =
    totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  const estimatedStreak =
    completedHabits === 0 ? 0 : Math.max(1, Math.min(completedHabits + 1, 7));

  const summaryCards = [
    { title: "Current Streak", value: `${estimatedStreak} days` },
    { title: "Completion Rate", value: `${completionRate}%` },
    { title: "Habits Completed", value: `${completedHabits} / ${totalHabits || 0}` },
    { title: "Active Goals", value: `${activeHabits}` },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="premium-dashboard-page">
      <div className="premium-dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            {profile?.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt="User profile"
                className="sidebar-user-photo"
              />
            ) : (
              <div className="sidebar-logo">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2>{fullName}</h2>
              <p>{username}</p>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Navigation</span>

            <button className="sidebar-link active-link" type="button">
              Dashboard
            </button>

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/habits")}
            >
              Habits
            </button>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Current Goal</span>
            <div className="sidebar-goal-box">
              <strong>{currentGoal}</strong>
              <p>Focused progress starts with small daily actions.</p>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Quick Identity</span>
            <div className="sidebar-goal-box">
              <strong>{fullName}</strong>
              <p>{profile?.email || "Add your email in profile settings"}</p>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="logout-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="premium-top-bar">
            <div>
              <p className="topbar-kicker">Dashboard Overview</p>
              <h1>Welcome back, {fullName}</h1>
              <p className="topbar-description">
                Review your progress, manage your habits, and maintain consistency
                with a clearer view of your health goals.
              </p>
            </div>

            <div className="top-bar-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </button>

              <button
                className="primary-button"
                onClick={() => navigate("/habits")}
              >
                + Manage Habits
              </button>
            </div>
          </div>

          <div className="summary-grid">
            {summaryCards.map((card) => (
              <div key={card.title} className="summary-card premium-card">
                <p>{card.title}</p>
                <h2>{card.value}</h2>
              </div>
            ))}
          </div>

          <div className="premium-dashboard-grid">
            <section className="panel-card premium-card">
              <div className="panel-header">
                <h3>Current Habits</h3>
                <span className="tag">Live Data</span>
              </div>

              {habits.length === 0 ? (
                <div className="empty-state">
                  <h4>No habits added yet</h4>
                  <p>
                    Start by creating habits in the objectives section so your
                    dashboard can display real progress data.
                  </p>
                </div>
              ) : (
                <div className="habit-list">
                  {habits.map((habit) => (
                    <div key={habit.id} className="habit-item premium-habit-item">
                      <div>
                        <h4>{habit.title}</h4>
                        <p>
                          {habit.type} • {habit.target}
                        </p>
                      </div>

                      <span
                        className={`status-badge ${
                          habit.progress === "Completed"
                            ? "completed"
                            : habit.progress === "In Progress"
                            ? "progress"
                            : "pending"
                        }`}
                      >
                        {habit.progress}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="premium-side-column">
              <section className="panel-card premium-card">
                <div className="panel-header">
                  <h3>Profile Snapshot</h3>
                  <span className="tag">Saved Data</span>
                </div>

                <div className="dashboard-user-card">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile preview"
                      className="dashboard-user-photo"
                    />
                  ) : (
                    <div className="dashboard-user-placeholder">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="dashboard-user-text">
                    <h4>{fullName}</h4>
                    <p>{username}</p>
                  </div>
                </div>

                <div className="snapshot-list">
                  <div className="snapshot-item">
                    <span>Email</span>
                    <strong>{profile?.email || "Not provided yet"}</strong>
                  </div>

                  <div className="snapshot-item">
                    <span>Weight</span>
                    <strong>
                      {profile?.weight ? `${profile.weight} kg` : "Not provided yet"}
                    </strong>
                  </div>

                  <div className="snapshot-item">
                    <span>Height</span>
                    <strong>
                      {profile?.height ? `${profile.height} cm` : "Not provided yet"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="panel-card premium-card">
                <div className="panel-header">
                  <h3>Weekly Completion</h3>
                  <span className="tag">Analytics</span>
                </div>

                <div className="progress-bar premium-progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <p className="panel-text">
                  {completionRate}% of your current habits are marked as completed.
                </p>
              </section>

              <section className="panel-card premium-card">
                <div className="panel-header">
                  <h3>Status Breakdown</h3>
                  <span className="tag">Summary</span>
                </div>

                <div className="snapshot-list">
                  <div className="snapshot-item">
                    <span>Completed</span>
                    <strong>{completedHabits}</strong>
                  </div>

                  <div className="snapshot-item">
                    <span>In Progress</span>
                    <strong>{activeHabits}</strong>
                  </div>

                  <div className="snapshot-item">
                    <span>Pending</span>
                    <strong>{pendingHabits}</strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}