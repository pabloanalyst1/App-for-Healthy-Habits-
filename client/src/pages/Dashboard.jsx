import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import metricsService from "../services/metricsService";
import authService from "../services/authService";
import MetricsChart from "../components/MetricsChart";

const buildCreateHabitForm = (categories) => {
  const firstCategory = categories[0];

  return {
    categoryId: firstCategory ? String(firstCategory.id) : "",
    customName: "",
    targetValue:
      firstCategory?.defaultTarget != null ? String(firstCategory.defaultTarget) : "",
    isActive: true,
  };
};

const buildEditHabitForm = (habit) => ({
  categoryId: String(habit.categoryId ?? habit.category?.id ?? ""),
  customName: habit.customName || "",
  targetValue:
    habit.targetValue != null ? String(habit.targetValue) : "",
  isActive: habit.isActive !== false,
});

export default function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [habitCategories, setHabitCategories] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitModalMode, setHabitModalMode] = useState("create");
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [habitForm, setHabitForm] = useState(buildCreateHabitForm([]));
  const [habitFormError, setHabitFormError] = useState(null);
  const [habitFeedback, setHabitFeedback] = useState(null);
  const [isSavingHabit, setIsSavingHabit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const loadDashboardData = async (preferredHabitId) => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, habits, categories] = await Promise.all([
        metricsService.getDashboard(),
        metricsService.getHabits(),
        metricsService.getCategories(),
      ]);

      setDashboardData(dashboard);
      setUserHabits(habits);
      setHabitCategories(categories);

      const nextSelectedHabitId =
        preferredHabitId === undefined ? selectedHabit?.id : preferredHabitId;

      setSelectedHabit(
        nextSelectedHabitId
          ? habits.find((habit) => habit.id === nextSelectedHabitId) || null
          : null
      );
    } catch (err) {
      console.error("Dashboard load error:", err);

      if (
        err.status === 401 ||
        err.status === 403 ||
        err.message?.includes("401") ||
        err.message?.includes("403")
      ) {
        authService.logout();
        navigate("/");
      } else {
        setError(err.message || "Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const availableCreateCategories = useMemo(() => {
    return habitCategories.filter(
      (category) =>
        !userHabits.some((habit) => Number(habit.categoryId) === Number(category.id))
    );
  }, [habitCategories, userHabits]);

  const modalCategoryOptions = useMemo(() => {
    if (habitModalMode === "edit") {
      return habitCategories.filter(
        (category) =>
          !userHabits.some(
            (habit) =>
              habit.id !== editingHabitId &&
              Number(habit.categoryId) === Number(category.id)
          )
      );
    }

    return availableCreateCategories;
  }, [availableCreateCategories, editingHabitId, habitCategories, habitModalMode, userHabits]);

  const selectedCategory = useMemo(() => {
    return (
      habitCategories.find(
        (category) => String(category.id) === String(habitForm.categoryId)
      ) || null
    );
  }, [habitCategories, habitForm.categoryId]);

  const selectedHabitTodayLog = useMemo(() => {
    if (!selectedHabit || !dashboardData?.todayLogs) {
      return null;
    }

    return (
      dashboardData.todayLogs.find((log) => log.habitId === selectedHabit.id) || null
    );
  }, [dashboardData, selectedHabit]);

  const openCreateHabitModal = () => {
    if (availableCreateCategories.length === 0) {
      setHabitFeedback({
        type: "error",
        message: "You already added every available habit category.",
      });
      return;
    }

    setHabitFeedback(null);
    setHabitFormError(null);
    setHabitModalMode("create");
    setEditingHabitId(null);
    setHabitForm(buildCreateHabitForm(availableCreateCategories));
    setShowHabitModal(true);
  };

  const openEditHabitModal = (habit) => {
    setHabitFeedback(null);
    setHabitFormError(null);
    setHabitModalMode("edit");
    setEditingHabitId(habit.id);
    setHabitForm(buildEditHabitForm(habit));
    setShowHabitModal(true);
  };

  const closeHabitModal = () => {
    setShowHabitModal(false);
    setEditingHabitId(null);
    setHabitFormError(null);
  };

  const handleHabitFormChange = (field, value) => {
    setHabitFormError(null);

    if (field === "categoryId") {
      const nextCategory = habitCategories.find(
        (category) => String(category.id) === String(value)
      );

      setHabitForm((prev) => ({
        ...prev,
        categoryId: value,
        targetValue:
          habitModalMode === "create"
            ? String(nextCategory?.defaultTarget ?? prev.targetValue)
            : prev.targetValue,
      }));
      return;
    }

    if (field === "isActive") {
      setHabitForm((prev) => ({
        ...prev,
        isActive: value === "active",
      }));
      return;
    }

    setHabitForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHabitSubmit = async (event) => {
    event.preventDefault();
    setHabitFormError(null);

    const parsedCategoryId = Number.parseInt(habitForm.categoryId, 10);
    const parsedTargetValue = Number.parseInt(habitForm.targetValue, 10);

    if (!Number.isInteger(parsedCategoryId)) {
      setHabitFormError("Please choose a habit category.");
      return;
    }

    if (!Number.isInteger(parsedTargetValue) || parsedTargetValue <= 0) {
      setHabitFormError("Target value must be a number greater than 0.");
      return;
    }

    try {
      setIsSavingHabit(true);

      const payload = {
        categoryId: parsedCategoryId,
        customName: habitForm.customName.trim() || null,
        targetValue: parsedTargetValue,
        isActive: habitForm.isActive,
      };

      const savedHabit =
        habitModalMode === "edit" && editingHabitId
          ? await metricsService.updateHabit(editingHabitId, payload)
          : await metricsService.addHabit(
              payload.categoryId,
              payload.customName,
              payload.targetValue,
              payload.isActive
            );

      closeHabitModal();
      setHabitFeedback({
        type: "success",
        message:
          habitModalMode === "edit"
            ? "Habit updated successfully."
            : "Habit created successfully.",
      });
      await loadDashboardData(savedHabit?.id);
    } catch (err) {
      console.error("Failed to save habit:", err);
      setHabitFormError(err.message || "Failed to save habit.");
    } finally {
      setIsSavingHabit(false);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    const habitToDelete = userHabits.find((habit) => habit.id === habitId);
    const habitLabel = habitToDelete?.customName || habitToDelete?.category?.name || "this habit";

    const confirmed = window.confirm(
      `Delete "${habitLabel}"? This will also remove its progress logs.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await metricsService.deleteHabit(habitId);
      setHabitFeedback({
        type: "success",
        message: "Habit deleted successfully.",
      });
      await loadDashboardData(selectedHabit?.id === habitId ? null : selectedHabit?.id);
    } catch (err) {
      console.error("Failed to delete habit:", err);
      setHabitFeedback({
        type: "error",
        message: err.message || "Failed to delete habit.",
      });
    }
  };

  const handleHabitToggle = async (habitId, completed) => {
    const targetHabit = userHabits.find((habit) => habit.id === habitId);

    if (targetHabit?.isActive === false) {
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      await metricsService.logHabit(habitId, today, !completed, null, null);
      setHabitFeedback(null);
      await loadDashboardData(selectedHabit?.id);
    } catch (err) {
      console.error("Failed to update habit:", err);
      setHabitFeedback({
        type: "error",
        message: err.message || "Failed to update habit progress.",
      });
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
            onClick={() => loadDashboardData()}
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

              <button className="primary-button" onClick={openCreateHabitModal}>
                + Add Habit
              </button>
            </div>
          </div>

          {habitFeedback && (
            <div
              className={`feedback-banner ${
                habitFeedback.type === "error" ? "feedback-error" : "feedback-success"
              }`}
            >
              {habitFeedback.message}
            </div>
          )}

          {showHabitModal && (
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
              onClick={closeHabitModal}
            >
              <div
                className="premium-card"
                style={{
                  borderRadius: "24px",
                  padding: "24px",
                  maxWidth: "640px",
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
                  <div>
                    <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>
                      {habitModalMode === "edit" ? "Edit Habit" : "Create Habit"}
                    </h2>
                    <p className="modal-subtitle">
                      Choose a category, customize the name, and set a target that
                      fits the user&apos;s goal.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeHabitModal}
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

                <form className="section-form" onSubmit={handleHabitSubmit}>
                  <div className="form-row">
                    <div className="section-field">
                      <label htmlFor="habit-category">Category</label>
                      <select
                        id="habit-category"
                        value={habitForm.categoryId}
                        onChange={(event) =>
                          handleHabitFormChange("categoryId", event.target.value)
                        }
                        className="dashboard-form-control"
                      >
                        <option value="">Select a category</option>
                        {modalCategoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="section-field">
                      <label htmlFor="habit-target">
                        Target {selectedCategory?.unit ? `(${selectedCategory.unit})` : ""}
                      </label>
                      <input
                        id="habit-target"
                        type="number"
                        min="1"
                        step="1"
                        value={habitForm.targetValue}
                        onChange={(event) =>
                          handleHabitFormChange("targetValue", event.target.value)
                        }
                        placeholder="Enter target"
                      />
                    </div>
                  </div>

                  <div className="section-field">
                    <label htmlFor="habit-name">Habit Name</label>
                    <input
                      id="habit-name"
                      type="text"
                      value={habitForm.customName}
                      onChange={(event) =>
                        handleHabitFormChange("customName", event.target.value)
                      }
                      placeholder={
                        selectedCategory?.name || "Leave blank to use the category name"
                      }
                    />
                    <span className="field-hint">
                      Leave this blank if you want to keep the category name as the
                      visible habit title.
                    </span>
                  </div>

                  <div className="section-field">
                    <label htmlFor="habit-status">Status</label>
                    <select
                      id="habit-status"
                      value={habitForm.isActive ? "active" : "inactive"}
                      onChange={(event) =>
                        handleHabitFormChange("isActive", event.target.value)
                      }
                      className="dashboard-form-control"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {selectedCategory && (
                    <div className="habit-category-hint">
                      <strong>{selectedCategory.name}</strong>
                      <p>
                        Default target: {selectedCategory.defaultTarget || 1}{" "}
                        {selectedCategory.unit || "units"}.
                        {selectedCategory.description
                          ? ` ${selectedCategory.description}`
                          : ""}
                      </p>
                    </div>
                  )}

                  {habitFormError && (
                    <div className="feedback-banner feedback-error">{habitFormError}</div>
                  )}

                  <div className="button-row">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={closeHabitModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isSavingHabit}
                    >
                      {isSavingHabit
                        ? "Saving..."
                        : habitModalMode === "edit"
                          ? "Save Changes"
                          : "Create Habit"}
                    </button>
                  </div>
                </form>
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
                        className={`habit-item premium-habit-item ${
                          habit.isActive === false ? "inactive-habit" : ""
                        }`}
                        style={{
                          borderColor: isSelected ? "#22c55e" : undefined,
                          background: isSelected ? "#ecfdf5" : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedHabit(habit)}
                      >
                        <div className="habit-item-content">
                          <div className="habit-title-row">
                            <h4>{habit.customName || habit.category?.name}</h4>
                            <span
                              className={`status-badge ${
                                habit.isActive === false
                                  ? "pending"
                                  : isCompleted
                                    ? "completed"
                                    : "progress"
                              }`}
                            >
                              {habit.isActive === false
                                ? "Inactive"
                                : isCompleted
                                  ? "Completed today"
                                  : "Active"}
                            </span>
                          </div>

                          <p>
                            {habit.category?.name || "Custom habit"} • Target:{" "}
                            {habit.targetValue} {habit.category?.unit}
                            {todayLog?.actualValue
                              ? ` • Today: ${todayLog.actualValue}`
                              : ""}
                          </p>
                        </div>

                        <div className="habit-item-actions">
                          <button
                            type="button"
                            className="secondary-button small-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditHabitModal(habit);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger-button small-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteHabit(habit.id);
                            }}
                          >
                            Delete
                          </button>

                          <button
                            type="button"
                            disabled={habit.isActive === false}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleHabitToggle(habit.id, isCompleted);
                            }}
                            className={
                              isCompleted || habit.isActive === false
                                ? "secondary-button small-button"
                                : "primary-button small-button"
                            }
                          >
                            {habit.isActive === false
                              ? "Inactive"
                              : isCompleted
                                ? "Completed"
                                : "Mark Complete"}
                          </button>
                        </div>
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
                      <strong>
                        {selectedHabit.customName || selectedHabit.category?.name}
                      </strong>
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

                    <div className="snapshot-item">
                      <span>Today</span>
                      <strong>
                        {selectedHabit.isActive
                          ? selectedHabitTodayLog?.completed
                            ? "Completed"
                            : "Pending"
                          : "Not tracking"}
                      </strong>
                    </div>
                  </div>

                  <div className="button-row">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => openEditHabitModal(selectedHabit)}
                    >
                      Edit Habit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDeleteHabit(selectedHabit.id)}
                    >
                      Delete Habit
                    </button>
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
