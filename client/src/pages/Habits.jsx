import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

const defaultHabit = {
  title: "",
  type: "",
  target: "",
};

export default function Habits() {
  const navigate = useNavigate();
  const [habitForm, setHabitForm] = useState(defaultHabit);
  const [habits, setHabits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedHabits = localStorage.getItem("healthyHabitsList");

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("healthyHabitsList", JSON.stringify(habits));
  }, [habits]);

  const totalHabits = habits.length;

  const completedHabits = useMemo(() => {
    return habits.filter((habit) => habit.progress === "Completed").length;
  }, [habits]);

  const activeHabits = useMemo(() => {
    return habits.filter((habit) => habit.progress === "In Progress").length;
  }, [habits]);

  const completionRate =
    totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  const handleChange = (event) => {
    const { id, value } = event.target;

    setHabitForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const resetForm = () => {
    setHabitForm(defaultHabit);
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!habitForm.title || !habitForm.type || !habitForm.target) {
      setMessage("Please complete all habit fields before saving.");
      clearMessageLater();
      return;
    }

    if (editingId !== null) {
      const updatedHabits = habits.map((habit) =>
        habit.id === editingId ? { ...habit, ...habitForm } : habit
      );

      setHabits(updatedHabits);
      setMessage("Habit updated successfully.");
    } else {
      const newHabit = {
        id: Date.now(),
        ...habitForm,
        progress: "In Progress",
      };

      setHabits((prev) => [newHabit, ...prev]);
      setMessage("Habit added successfully.");
    }

    resetForm();
    clearMessageLater();
  };

  const clearMessageLater = () => {
    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const handleEditHabit = (habit) => {
    setHabitForm({
      title: habit.title,
      type: habit.type,
      target: habit.target,
    });
    setEditingId(habit.id);
    setMessage("You are now editing an existing habit.");
    clearMessageLater();
  };

  const handleDeleteHabit = (id) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);

    if (editingId === id) {
      resetForm();
    }

    setMessage("Habit deleted successfully.");
    clearMessageLater();
  };

  const handleToggleProgress = (id) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id !== id) return habit;

      let nextProgress = "In Progress";

      if (habit.progress === "In Progress") {
        nextProgress = "Completed";
      } else if (habit.progress === "Completed") {
        nextProgress = "Pending";
      } else {
        nextProgress = "In Progress";
      }

      return {
        ...habit,
        progress: nextProgress,
      };
    });

    setHabits(updatedHabits);
  };

  return (
    <div className="section-page">
      <div className="section-container">
        <div className="section-top-bar">
          <div>
            <h1>Objectives Creation</h1>
            <p>Create, update, manage, and review healthy habits and personal goals.</p>
          </div>

          <button className="secondary-button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="summary-grid">
          <Card className="summary-card premium-card summary-card-premium" size="sm">
            <CardContent className="summary-card-content">
              <p>Total Habits</p>
              <h2>{totalHabits}</h2>
            </CardContent>
          </Card>

          <Card className="summary-card premium-card summary-card-premium" size="sm">
            <CardContent className="summary-card-content">
              <p>Completed</p>
              <h2>{completedHabits}</h2>
            </CardContent>
          </Card>

          <Card className="summary-card premium-card summary-card-premium" size="sm">
            <CardContent className="summary-card-content">
              <p>Active</p>
              <h2>{activeHabits}</h2>
            </CardContent>
          </Card>

          <Card className="summary-card premium-card summary-card-premium" size="sm">
            <CardContent className="summary-card-content">
              <p>Completion Rate</p>
              <h2>{completionRate}%</h2>
            </CardContent>
          </Card>
        </div>

        <div className="habits-layout">
          <Card className="form-card premium-card habits-form-card">
            <CardHeader className="panel-header">
              <div>
                <CardTitle>{editingId ? "Update Habit" : "Create New Habit"}</CardTitle>
                <CardDescription className="habits-card-description">
                  Add and manage personal habit goals with a clear and organized workflow.
                </CardDescription>
              </div>
              <span className="tag">{editingId ? "Edit Mode" : "New Objective"}</span>
            </CardHeader>

            <CardContent>
              <form className="section-form" onSubmit={handleSubmit}>
                <div className="section-field">
                  <label htmlFor="title">Habit Title</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Example: Morning walk"
                    value={habitForm.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="section-field">
                    <label htmlFor="type">Habit Type</label>
                    <input
                      id="type"
                      type="text"
                      placeholder="Example: Cardio, Nutrition, Sleep"
                      value={habitForm.type}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="section-field">
                    <label htmlFor="target">Goal Target</label>
                    <input
                      id="target"
                      type="text"
                      placeholder="Example: 30 minutes or 500 calories"
                      value={habitForm.target}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="button-row">
                  <button className="primary-button" type="submit">
                    {editingId ? "Save Changes" : "Add Habit"}
                  </button>

                  <button className="secondary-button" type="button" onClick={resetForm}>
                    Clear Form
                  </button>
                </div>

                {message && <p className="success-message">{message}</p>}
              </form>
            </CardContent>
          </Card>

          <Card className="form-card premium-card habits-tracking-card">
            <CardHeader className="panel-header">
              <div>
                <CardTitle>Goals Tracking</CardTitle>
                <CardDescription className="habits-card-description">
                  Follow measurable progress and keep a clearer view of performance.
                </CardDescription>
              </div>
              <span className="tag">Progress Data</span>
            </CardHeader>

            <CardContent>
              <p className="panel-text">
                This section is prepared for tracking measurable goal data such as calories
                burned, minutes trained, repetitions completed, or other real progress values.
              </p>

              <div className="tracking-card">
                <div className="tracking-item">
                  <span>Goal</span>
                  <strong>Burn 500 calories</strong>
                </div>

                <div className="tracking-item">
                  <span>Current Progress</span>
                  <strong>300 calories completed</strong>
                </div>

                <div className="tracking-item">
                  <span>Completion</span>
                  <strong>60%</strong>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill tracking-fill" />
                </div>

                <p className="panel-text compact-text">
                  This area can later be connected to detailed goals tracking logic.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="form-card premium-card habits-list-card">
          <CardHeader className="panel-header">
            <div>
              <CardTitle>Current Habits</CardTitle>
              <CardDescription className="habits-card-description">
                Review and manage all current objectives from one place.
              </CardDescription>
            </div>
            <span className="tag">Manage Objectives</span>
          </CardHeader>

          <CardContent>
            {habits.length === 0 ? (
              <div className="empty-state">
                <h4>No habits created yet</h4>
                <p>
                  Add your first objective to start building your healthy habits workflow.
                </p>
              </div>
            ) : (
              <div className="habit-list">
                {habits.map((habit) => (
                  <div key={habit.id} className="habit-item advanced-habit-item">
                    <div className="habit-main-info">
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

                    <div className="habit-actions-row">
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => handleEditHabit(habit)}
                      >
                        Edit
                      </button>

                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => handleToggleProgress(habit.id)}
                      >
                        Change Status
                      </button>

                      <button
                        className="danger-button small-button"
                        type="button"
                        onClick={() => handleDeleteHabit(habit.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}