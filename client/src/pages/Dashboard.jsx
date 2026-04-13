import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Target,
  CheckCircle2,
  Flag,
  LayoutDashboard,
  UserCircle2,
  ListChecks,
  Settings2,
  Wrench,
  Activity,
  LineChart,
  Sparkles,
  BarChart3,
  Eye,
} from "lucide-react";
import metricsService from "../services/metricsService";
import authService from "../services/authService";
import MetricsChart from "../components/MetricsChart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const CUSTOM_CATEGORY_VALUE = "__custom_category__";

const buildCreateHabitForm = (categories) => {
  const firstCategory = categories[0];

  return {
    categoryId: firstCategory ? String(firstCategory.id) : "",
    customCategoryLabel: "",
    customName: "",
    targetValue:
      firstCategory?.defaultTarget != null ? String(firstCategory.defaultTarget) : "",
    isActive: true,
  };
};

const buildEditHabitForm = (habit) => ({
  categoryId: String(habit.categoryId ?? habit.category?.id ?? ""),
  customCategoryLabel: habit.customCategoryLabel || "",
  customName: habit.customName || "",
  targetValue: habit.targetValue != null ? String(habit.targetValue) : "",
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

      const customCategoryMap = JSON.parse(
        localStorage.getItem("healthyHabitsCustomCategories") || "{}"
      );

      const mergedHabits = habits.map((habit) => ({
        ...habit,
        customCategoryLabel: customCategoryMap[String(habit.id)] || "",
      }));

      setDashboardData(dashboard);
      setUserHabits(mergedHabits);
      setHabitCategories(categories);

      const nextSelectedHabitId =
        preferredHabitId === undefined ? selectedHabit?.id : preferredHabitId;

      setSelectedHabit(
        nextSelectedHabitId
          ? mergedHabits.find((habit) => habit.id === nextSelectedHabitId) || null
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

  const modalCategoryOptions = useMemo(() => {
    return habitCategories;
  }, [habitCategories]);

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
    setHabitFeedback(null);
    setHabitFormError(null);
    setHabitModalMode("create");
    setEditingHabitId(null);
    setHabitForm(buildCreateHabitForm(habitCategories));
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
      if (value === CUSTOM_CATEGORY_VALUE) {
        setHabitForm((prev) => ({
          ...prev,
          categoryId: value,
          targetValue: prev.targetValue || "1",
        }));
        return;
      }

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

  const handleQuickCategorySelect = (categoryId) => {
    const nextCategory = habitCategories.find(
      (category) => String(category.id) === String(categoryId)
    );

    if (!nextCategory) return;

    setHabitForm((prev) => ({
      ...prev,
      categoryId: String(nextCategory.id),
      targetValue:
        habitModalMode === "create"
          ? String(nextCategory.defaultTarget ?? prev.targetValue)
          : prev.targetValue,
    }));
  };

  const handleHabitSubmit = async (event) => {
    event.preventDefault();
    setHabitFormError(null);

    const isCustomCategory = habitForm.categoryId === CUSTOM_CATEGORY_VALUE;
    const parsedCategoryId = Number.parseInt(habitForm.categoryId, 10);
    const parsedTargetValue = Number.parseInt(habitForm.targetValue, 10);

    if (!isCustomCategory && !Number.isInteger(parsedCategoryId)) {
      setHabitFormError("Please choose a habit category.");
      return;
    }

    if (isCustomCategory && !habitForm.customCategoryLabel.trim()) {
      setHabitFormError("Please write a custom category label.");
      return;
    }

    if (!Number.isInteger(parsedTargetValue) || parsedTargetValue <= 0) {
      setHabitFormError("Target value must be a number greater than 0.");
      return;
    }

    try {
      setIsSavingHabit(true);

      const fallbackCategoryId =
        habitCategories[0]?.id != null ? Number(habitCategories[0].id) : null;

      if (fallbackCategoryId == null) {
        setHabitFormError("No default categories are available.");
        setIsSavingHabit(false);
        return;
      }

      const finalCategoryId = isCustomCategory ? fallbackCategoryId : parsedCategoryId;

      const customLabelPrefix = isCustomCategory
        ? `[${habitForm.customCategoryLabel.trim()}] `
        : "";

      const finalCustomName = `${
        customLabelPrefix
      }${habitForm.customName.trim()}`.trim() || null;

      const payload = {
        categoryId: finalCategoryId,
        customName: finalCustomName,
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

      if (isCustomCategory && savedHabit?.id) {
        const existingMap = JSON.parse(
          localStorage.getItem("healthyHabitsCustomCategories") || "{}"
        );
        existingMap[String(savedHabit.id)] = habitForm.customCategoryLabel.trim();
        localStorage.setItem(
          "healthyHabitsCustomCategories",
          JSON.stringify(existingMap)
        );
      }

      if (habitModalMode === "edit" && editingHabitId) {
        const existingMap = JSON.parse(
          localStorage.getItem("healthyHabitsCustomCategories") || "{}"
        );

        if (isCustomCategory) {
          existingMap[String(editingHabitId)] = habitForm.customCategoryLabel.trim();
        } else {
          delete existingMap[String(editingHabitId)];
        }

        localStorage.setItem(
          "healthyHabitsCustomCategories",
          JSON.stringify(existingMap)
        );
      }

      closeHabitModal();
      setHabitFeedback({
        type: "success",
        message:
          habitModalMode === "edit"
            ? "Habit updated successfully."
            : isCustomCategory
              ? "Habit created successfully with a custom category label."
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
    const habitLabel =
      habitToDelete?.customName || habitToDelete?.category?.name || "this habit";

    const confirmed = window.confirm(
      `Delete "${habitLabel}"? This will also remove its progress logs.`
    );

    if (!confirmed) return;

    try {
      await metricsService.deleteHabit(habitId);

      const existingMap = JSON.parse(
        localStorage.getItem("healthyHabitsCustomCategories") || "{}"
      );
      delete existingMap[String(habitId)];
      localStorage.setItem(
        "healthyHabitsCustomCategories",
        JSON.stringify(existingMap)
      );

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
    {
      title: "Current Streak",
      value: `${estimatedStreak} days`,
      icon: <Flame size={20} className="summary-card-icon flame-icon" />,
      accentClass: "summary-accent-orange",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: <Target size={20} className="summary-card-icon" />,
      accentClass: "summary-accent-indigo",
    },
    {
      title: "Habits Completed",
      value: `${completedHabits} / ${totalHabits}`,
      icon: <CheckCircle2 size={20} className="summary-card-icon success-icon" />,
      accentClass: "summary-accent-green",
    },
    {
      title: "Active Goals",
      value: `${activeHabits}`,
      icon: <Flag size={20} className="summary-card-icon accent-icon" />,
      accentClass: "summary-accent-blue",
    },
  ];

  const getVisibleCategoryName = (habit) => {
    return habit.customCategoryLabel || habit.category?.name || "Not available";
  };

  const getHabitBadgeVariant = (habit, isCompleted) => {
    if (habit.isActive === false) return "outline";
    if (isCompleted) return "success";
    return "warning";
  };

  const getHabitBadgeText = (habit, isCompleted) => {
    if (habit.isActive === false) return "Inactive";
    if (isCompleted) return "Completed today";
    return "Active";
  };

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
          <Button onClick={() => loadDashboardData()}>Try Again</Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
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

            <div className="sidebar-brand-text">
              <h2>{fullName}</h2>
              <p>{username}</p>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Navigation</span>

            <button className="sidebar-link active-link" type="button">
              <span className="sidebar-link-content">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </span>
            </button>

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/profile")}
            >
              <span className="sidebar-link-content">
                <UserCircle2 size={16} />
                <span>Profile</span>
              </span>
            </button>

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/habits")}
            >
              <span className="sidebar-link-content">
                <ListChecks size={16} />
                <span>Habits</span>
              </span>
            </button>

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/tools")}
            >
              <span className="sidebar-link-content">
                <Wrench size={16} />
                <span>Tools</span>
              </span>
            </button>

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/settings")}
            >
              <span className="sidebar-link-content">
                <Settings2 size={16} />
                <span>Settings</span>
              </span>
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
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Edit Profile
              </Button>

              <Button variant="outline" onClick={() => navigate("/tools")}>
                Open Tools
              </Button>

              <Button onClick={openCreateHabitModal}>+ Add Habit</Button>
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
            <div className="dashboard-modal-overlay" onClick={closeHabitModal}>
              <Card
                className="premium-card dashboard-modal-card"
                onClick={(event) => event.stopPropagation()}
              >
                <CardHeader className="dashboard-modal-header">
                  <div>
                    <CardTitle className="dashboard-modal-title">
                      {habitModalMode === "edit" ? "Edit Habit" : "Create Habit"}
                    </CardTitle>
                    <CardDescription className="modal-subtitle">
                      Choose a default category, customize the visible habit name,
                      or use your own custom category label.
                    </CardDescription>
                  </div>

                  <button
                    type="button"
                    onClick={closeHabitModal}
                    className="dashboard-modal-close"
                  >
                    ×
                  </button>
                </CardHeader>

                <CardContent className="dashboard-modal-content">
                  <form className="section-form" onSubmit={handleHabitSubmit}>
                    <Field>
                      <FieldLabel>Quick Categories</FieldLabel>
                      <div className="category-chip-grid">
                        {modalCategoryOptions.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className={`category-chip-button ${
                              String(habitForm.categoryId) === String(category.id)
                                ? "category-chip-button-active"
                                : ""
                            }`}
                            onClick={() => handleQuickCategorySelect(category.id)}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                      <FieldDescription>
                        Choose one of the predefined categories for faster setup.
                      </FieldDescription>
                    </Field>

                    <div className="form-row">
                      <Field className="section-field">
                        <FieldLabel>Default Category</FieldLabel>
                        <Select
                          value={habitForm.categoryId}
                          onValueChange={(value) =>
                            handleHabitFormChange("categoryId", value)
                          }
                        >
                          <SelectTrigger className="dashboard-select-modern">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectPopup>
                            {modalCategoryOptions.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                            <SelectItem value={CUSTOM_CATEGORY_VALUE}>
                              Create custom category label
                            </SelectItem>
                          </SelectPopup>
                        </Select>
                      </Field>

                      <Field className="section-field">
                        <FieldLabel>
                          Target {selectedCategory?.unit ? `(${selectedCategory.unit})` : ""}
                        </FieldLabel>
                        <Input
                          id="habit-target"
                          type="number"
                          min="1"
                          step="1"
                          value={habitForm.targetValue}
                          onChange={(event) =>
                            handleHabitFormChange("targetValue", event.target.value)
                          }
                          placeholder="Enter target"
                          className="dashboard-input-modern"
                          nativeInput
                        />
                      </Field>
                    </div>

                    {habitForm.categoryId === CUSTOM_CATEGORY_VALUE && (
                      <Field className="section-field">
                        <FieldLabel>Custom Category Label</FieldLabel>
                        <Input
                          id="custom-category-label"
                          type="text"
                          value={habitForm.customCategoryLabel}
                          onChange={(event) =>
                            handleHabitFormChange("customCategoryLabel", event.target.value)
                          }
                          placeholder="Example: Studying, Work, Reading"
                          className="dashboard-input-modern"
                          nativeInput
                        />
                        <FieldDescription>
                          This creates a custom visible category label for your own organization.
                        </FieldDescription>
                      </Field>
                    )}

                    <Field className="section-field">
                      <FieldLabel>Custom Habit Name or Personal Label</FieldLabel>
                      <Input
                        id="habit-name"
                        type="text"
                        value={habitForm.customName}
                        onChange={(event) =>
                          handleHabitFormChange("customName", event.target.value)
                        }
                        placeholder={
                          selectedCategory?.name
                            ? `Example: Food, Training, Studying, ${selectedCategory.name}`
                            : "Example: Food, Training, Studying"
                        }
                        className="dashboard-input-modern"
                        nativeInput
                      />
                      <FieldDescription>
                        You can keep the default category or write your own visible habit
                        name, such as Food, Training, Studying, Morning Cardio, or
                        Protein Lunch.
                      </FieldDescription>
                    </Field>

                    <Field className="section-field">
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={habitForm.isActive ? "active" : "inactive"}
                        onValueChange={(value) =>
                          handleHabitFormChange("isActive", value)
                        }
                      >
                        <SelectTrigger className="dashboard-select-modern">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectPopup>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectPopup>
                      </Select>
                    </Field>

                    <div className="habit-category-hint">
                      <strong>How this works</strong>
                      <p>
                        The system categories are predefined. You can still personalize
                        the habit name freely, and you can also add a custom visible
                        category label such as Studying, Work, or Reading.
                      </p>
                    </div>

                    {selectedCategory && habitForm.categoryId !== CUSTOM_CATEGORY_VALUE && (
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
                      <FieldError className="feedback-banner feedback-error">
                        {habitFormError}
                      </FieldError>
                    )}

                    <div className="button-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeHabitModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={isSavingHabit}
                        disabled={isSavingHabit}
                      >
                        {habitModalMode === "edit" ? "Save Changes" : "Create Habit"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="summary-grid">
            {summaryCards.map((card) => (
              <Card
                key={card.title}
                className={`summary-card premium-card summary-card-premium ${card.accentClass}`}
                size="sm"
              >
                <CardContent className="summary-card-content">
                  <div className="summary-card-top">
                    <div className="summary-card-icon-wrap">{card.icon}</div>
                    <p>{card.title}</p>
                  </div>
                  <h2>{card.value}</h2>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="premium-dashboard-grid">
            <Card className="panel-card premium-card panel-card-premium dashboard-lift-card">
              <CardHeader className="panel-header">
                <div className="panel-title-group">
                  <div className="panel-title-icon panel-title-icon-green">
                    <ListChecks size={16} />
                  </div>
                  <CardTitle>Current Habits</CardTitle>
                </div>
                <Badge variant="success">Live Data</Badge>
              </CardHeader>

              <CardContent>
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
                          className={`habit-item premium-habit-item premium-habit-hover ${
                            habit.isActive === false ? "inactive-habit" : ""
                          } ${isSelected ? "premium-habit-selected" : ""}`}
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
                              <Badge variant={getHabitBadgeVariant(habit, isCompleted)}>
                                {getHabitBadgeText(habit, isCompleted)}
                              </Badge>
                            </div>

                            <p>
                              {getVisibleCategoryName(habit)} • Target:{" "}
                              {habit.targetValue} {habit.category?.unit}
                              {todayLog?.actualValue
                                ? ` • Today: ${todayLog.actualValue}`
                                : ""}
                            </p>
                          </div>

                          <div className="habit-item-actions">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditHabitModal(habit);
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteHabit(habit.id);
                              }}
                            >
                              Delete
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant={
                                isCompleted || habit.isActive === false
                                  ? "secondary"
                                  : "default"
                              }
                              disabled={habit.isActive === false}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleHabitToggle(habit.id, isCompleted);
                              }}
                            >
                              {habit.isActive === false
                                ? "Inactive"
                                : isCompleted
                                  ? "Completed"
                                  : "Mark Complete"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="premium-side-column">
              {selectedHabit && (
                <Card className="panel-card premium-card panel-card-premium dashboard-lift-card">
                  <CardHeader className="panel-header">
                    <div className="panel-title-group">
                      <div className="panel-title-icon panel-title-icon-slate">
                        <Eye size={16} />
                      </div>
                      <CardTitle>Habit Preview</CardTitle>
                    </div>
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
                  </CardHeader>

                  <CardContent>
                    <div className="snapshot-list">
                      <div className="snapshot-item">
                        <span>Habit</span>
                        <strong>
                          {selectedHabit.customName || selectedHabit.category?.name}
                        </strong>
                      </div>

                      <div className="snapshot-item">
                        <span>Category</span>
                        <strong>{getVisibleCategoryName(selectedHabit)}</strong>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openEditHabitModal(selectedHabit)}
                      >
                        Edit Habit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteHabit(selectedHabit.id)}
                      >
                        Delete Habit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="panel-card premium-card panel-card-premium dashboard-lift-card">
                <CardHeader className="panel-header">
                  <div className="panel-title-group">
                    <div className="panel-title-icon panel-title-icon-emerald">
                      <LineChart size={16} />
                    </div>
                    <CardTitle>Progress Overview</CardTitle>
                  </div>
                  <Badge variant="info">Chart</Badge>
                </CardHeader>

                <CardContent>
                  <MetricsChart title="Daily Completions" />
                </CardContent>
              </Card>

              <Card className="panel-card premium-card panel-card-premium dashboard-lift-card">
                <CardHeader className="panel-header">
                  <div className="panel-title-group">
                    <div className="panel-title-icon panel-title-icon-violet">
                      <Sparkles size={16} />
                    </div>
                    <CardTitle>Quick Summary</CardTitle>
                  </div>
                  <Badge variant="secondary">Insights</Badge>
                </CardHeader>

                <CardContent>
                  <p className="panel-text">
                    {dashboardData?.completedToday > 0
                      ? `Great job! You've completed ${dashboardData.completedToday} habit${
                          dashboardData.completedToday > 1 ? "s" : ""
                        } today. Keep the momentum going.`
                      : "No habits completed today yet. Start building your streak by completing your first habit."}
                  </p>
                </CardContent>
              </Card>

              <Card className="panel-card premium-card panel-card-premium dashboard-lift-card">
                <CardHeader className="panel-header">
                  <div className="panel-title-group">
                    <div className="panel-title-icon panel-title-icon-green">
                      <Activity size={16} />
                    </div>
                    <CardTitle>Weekly Completion</CardTitle>
                  </div>
                  <Badge variant="success">Analytics</Badge>
                </CardHeader>

                <CardContent>
                  <div className="progress-bar premium-progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  <p className="panel-text">
                    {completionRate}% of your weekly goal completed.
                  </p>
                </CardContent>
              </Card>

              <Card className="panel-card premium-card panel-card-premium dashboard-lift-card">
                <CardHeader className="panel-header">
                  <div className="panel-title-group">
                    <div className="panel-title-icon panel-title-icon-blue">
                      <BarChart3 size={16} />
                    </div>
                    <CardTitle>Status Breakdown</CardTitle>
                  </div>
                  <Badge variant="outline">Summary</Badge>
                </CardHeader>

                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}