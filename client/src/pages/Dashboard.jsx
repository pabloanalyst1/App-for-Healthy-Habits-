import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import metricsService from "../services/metricsService";
import authService from "../services/authService";
import MetricsChart from "../components/MetricsChart";

export default function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showHabitSelection, setShowHabitSelection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const habitCategories = [
    "Daily Water Intake",
    "Physical Activity",
    "Sleep Duration & Quality",
    "Healthy Eating",
    "Mental Wellness",
  ];

  useEffect(() => {
    const savedProfile = localStorage.getItem("healthyHabitsProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, habits] = await Promise.all([
        metricsService.getDashboard(),
        metricsService.getHabits(),
      ]);

      setDashboardData(dashboard);
      setUserHabits(habits);
    } catch (err) {
      console.error("Dashboard load error:", err);

      if (err.message?.includes("401") || err.message?.includes("403")) {
        authService.logout();
        navigate("/");
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (categoryName) => {
    try {
      const categories = await metricsService.getCategories();
      const category = categories.find((cat) => cat.name === categoryName);

      if (category) {
        const defaultTarget = category.defaultTarget || 1;
        await metricsService.addHabit(category.id, null, defaultTarget);
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Failed to add habit:", err);
    }

    setShowHabitSelection(false);
  };

  const handleHabitToggle = async (habitId, completed) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await metricsService.logHabit(habitId, today, !completed, null, null);
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to update habit:", err);
    }
  };

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

  const totalHabits = userHabits.length;

  const completedHabits = useMemo(() => {
    if (!dashboardData?.todayLogs) return 0;
    return dashboardData.todayLogs.filter((log) => log.completed).length;
  }, [dashboardData]);

  const activeHabits = useMemo(() => {
    return userHabits.filter((habit) => habit.isActive !== false).length;
  }, [userHabits]);

  const pendingHabits = useMemo(() => {
    return Math.max(totalHabits - completedHabits, 0);
  }, [totalHabits, completedHabits]);

  const completionRate =
    dashboardData?.completionRate ??
    (totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100));

  const estimatedStreak = dashboardData?.currentStreak ?? 0;

  const summaryCards = [
    { title: "Current Streak", value: `${estimatedStreak} days` },
    { title: "Completion Rate", value: `${completionRate}%` },
    { title: "Habits Completed", value: `${completedHabits} / ${totalHabits}` },
    { title: "Active Goals", value: `${activeHabits}` },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/");
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
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: "16px",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#dc2626", margin: 0 }}>Unable to Load Dashboard</h2>
        <p style={{ color: "#64748b", margin: 0 }}>{error}</p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={loadDashboardData}
            className="primary-button"
            type="button"
          >
            Try Again
          </button>

          <button
            onClick={handleLogout}
            className="secondary-button"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

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
              <div className="sidebar-logo">{fullName.charAt(0).toUpperCase()}</div>
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

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/settings")}
            >
              Settings
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
                onClick={() => setShowHabitSelection(true)}
              >
                + Add Habit
              </button>
            </div>
          </div>

          {showHabitSelection && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                padding: "20px",
              }}
              onClick={() => setShowHabitSelection(false)}
            >
              <div
                className="premium-card"
                style={{
                  borderRadius: "24px",
                  padding: "24px",
                  maxWidth: "560px",
                  width: "100%",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                    gap: "12px",
                  }}
                >
                  <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>
                    Choose a Habit Category
                  </h2>

                  <button
                    type="button"
                    onClick={() => setShowHabitSelection(false)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "24px",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {habitCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleAddHabit(category)}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        padding: "16px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

              {userHabits.length === 0 ? (
                <div className="empty-state">
                  <h4>No habits added yet</h4>
                  <p>
                    Start by creating habits so your dashboard can display real
                    progress data.
                  </p>
                </div>
              ) : (
                <div className="habit-list">
                  {userHabits.map((habit) => {
                    const todayLog = dashboardData?.todayLogs?.find(
                      (log) => log.habitId === habit.id
                    );
                    const isCompleted = todayLog?.completed || false;
                    const isSelected = selectedHabit?.id === habit.id;

                    return (
                      <div
                        key={habit.id}
                        className="habit-item premium-habit-item"
                        style={{
                          borderColor: isSelected ? "#22c55e" : undefined,
                          background: isSelected ? "#ecfdf5" : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedHabit(habit)}
                      >
                        <div>
                          <h4>{habit.customName || habit.category?.name}</h4>
                          <p>
                            Target: {habit.targetValue} {habit.category?.unit}
                            {todayLog?.actualValue
                              ? ` • Today: ${todayLog.actualValue}`
                              : ""}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleHabitToggle(habit.id, isCompleted);
                          }}
                          className={
                            isCompleted ? "secondary-button small-button" : "primary-button small-button"
                          }
                        >
                          {isCompleted ? "Completed" : "Mark Complete"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="premium-side-column">
              {selectedHabit && (
                <section className="panel-card premium-card">
                  <div className="panel-header">
                    <h3>Habit Preview</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedHabit(null)}
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "#64748b",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="snapshot-list">
                    <div className="snapshot-item">
                      <span>Habit</span>
                      <strong>{selectedHabit.customName || selectedHabit.category?.name}</strong>
                    </div>

                    <div className="snapshot-item">
                      <span>Category</span>
                      <strong>{selectedHabit.category?.name || "Not available"}</strong>
                    </div>

                    <div className="snapshot-item">
                      <span>Target</span>
                      <strong>
                        {selectedHabit.targetValue} {selectedHabit.category?.unit}
                      </strong>
                    </div>

                    <div className="snapshot-item">
                      <span>Status</span>
                      <strong>{selectedHabit.isActive ? "Active" : "Inactive"}</strong>
                    </div>
                  </div>
                </section>
              )}

              <section className="panel-card premium-card">
                <div className="panel-header">
                  <h3>Progress Overview</h3>
                  <span className="tag">Chart</span>
                </div>

                <MetricsChart title="Daily Completions" />
              </section>

              <section className="panel-card premium-card">
                <div className="panel-header">
                  <h3>Quick Summary</h3>
                  <span className="tag">Insights</span>
                </div>

                <p className="panel-text">
                  {dashboardData?.completedToday > 0
                    ? `Great job! You've completed ${dashboardData.completedToday} habit${
                        dashboardData.completedToday > 1 ? "s" : ""
                      } today. Keep the momentum going.`
                    : "No habits completed today yet. Start building your streak by completing your first habit."}
                </p>
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
                  {completionRate}% of your weekly goal completed.
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