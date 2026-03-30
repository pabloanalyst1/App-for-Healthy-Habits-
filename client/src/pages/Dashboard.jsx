import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import metricsService from '../services/metricsService';
import authService from '../services/authService';
import MetricsChart from '../components/MetricsChart';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showHabitSelection, setShowHabitSelection] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const habitCategories = [
    "Daily Water Intake",
    "Physical Activity",
    "Sleep Duration & Quality",
    "Healthy Eating",
    "Mental Wellness"
  ];

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading dashboard data...');
      console.log('Token exists:', !!localStorage.getItem('token'));

      const [dashboard, habits] = await Promise.all([
        metricsService.getDashboard(),
        metricsService.getHabits()
      ]);
      console.log('Dashboard data loaded:', dashboard);
      console.log('Habits loaded:', habits);

      setDashboardData(dashboard);
      setUserHabits(habits);
    } catch (err) {
      console.error('Dashboard load error:', err);
      if (err.message?.includes('401') || err.message?.includes('403')) {
        // Token expired or invalid, redirect to login
        console.log('Token invalid, redirecting to login');
        authService.logout();
        navigate('/');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (categoryName) => {
    try {
      // Find the category ID from the categories
      const categories = await metricsService.getCategories();
      const category = categories.find(cat => cat.name === categoryName);

      if (category) {
        const defaultTarget = category.defaultTarget || 1;
        await metricsService.addHabit(category.id, null, defaultTarget);
        await loadDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
    setShowHabitSelection(false);
  };

  const handleHabitToggle = async (habitId, completed) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await metricsService.logHabit(habitId, today, !completed, null, null);
      await loadDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to update habit:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Unable to Load Dashboard</h2>
          <p style={{ color: '#64748b' }}>{error}</p>
        </div>
        <div>
          <button
            onClick={loadDashboardData}
            style={{
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => {
              authService.logout();
              navigate('/');
            }}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { title: "Current Streak", value: `${dashboardData?.currentStreak || 0} days` },
    { title: "Completion Rate", value: `${dashboardData?.completionRate || 0}%` },
    { title: "Habits Completed", value: `${dashboardData?.completedToday || 0} / ${dashboardData?.activeHabits || 0}` },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ecfdf5 0%, #f8fafc 45%, #eef2ff 100%)",
        fontFamily: "Arial, sans-serif",
        padding: "28px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "18px 24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#15803d",
                fontSize: "30px",
              }}
            >
              Healthy Habits Dashboard
            </h1>
            <p
              style={{
                margin: "6px 0 0 0",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Track your habits, review progress, and stay consistent.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowHabitSelection(true)}
              style={{
                background: "#15803d",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + Add Habit
            </button>
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Settings
            </button>
            <button
              onClick={() => {
                authService.logout();
                navigate('/');
              }}
              style={{
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Habit Selection Modal */}
        {showHabitSelection && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowHabitSelection(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                maxWidth: "500px",
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "24px",
                  }}
                >
                  Choose a Habit Category
                </h2>
                <button
                  onClick={() => setShowHabitSelection(false)}
                  style={{
                    background: "none",
                    border: "none",
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
                    onClick={() => handleAddHabit(category)}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#374151",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#ecfdf5";
                      e.target.style.borderColor = "#22c55e";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#f8fafc";
                      e.target.style.borderColor = "#e5e7eb";
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {summaryCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "22px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {card.title}
              </p>
              <h2
                style={{
                  margin: "10px 0 0 0",
                  color: "#0f172a",
                  fontSize: "28px",
                }}
              >
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
          }}
        >
          {/* Habits section */}
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  color: "#0f172a",
                }}
              >
                Today&apos;s Habits
              </h3>

              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                Daily Focus
              </span>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {userHabits.map((habit) => {
                const todayLog = dashboardData?.todayLogs?.find(log => log.habitId === habit.id);
                const isCompleted = todayLog?.completed || false;
                const isSelected = selectedHabit?.id === habit.id;

                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabit(habit)}
                    style={{
                      border: `2px solid ${isSelected ? "#22c55e" : "#e5e7eb"}`,
                      borderRadius: "16px",
                      padding: "16px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isSelected ? "#ecfdf5" : "#f8fafc",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "17px",
                          color: "#111827",
                        }}
                      >
                        {habit.customName || habit.category?.name}
                      </h4>
                      <p
                        style={{
                          margin: "6px 0 0 0",
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        Target: {habit.targetValue} {habit.category?.unit}
                        {todayLog?.actualValue && ` | Today: ${todayLog.actualValue}`}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHabitToggle(habit.id, isCompleted);
                      }}
                      style={{
                        background: isCompleted ? "#dcfce7" : "#f3f4f6",
                        color: isCompleted ? "#166534" : "#374151",
                        border: "1px solid",
                        borderColor: isCompleted ? "#22c55e" : "#d1d5db",
                        borderRadius: "999px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {isCompleted ? "✓ Completed" : "Mark Complete"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "grid", gap: "24px" }}>
            {/* Selected Habit Preview */}
            {selectedHabit && (
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  border: "2px solid #22c55e",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3
                    style={{
                      margin: 0,
                      color: "#0f172a",
                      fontSize: "18px",
                    }}
                  >
                    Habit Preview
                  </h3>
                  <button
                    onClick={() => setSelectedHabit(null)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    ×
                  </button>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: "16px" }}>
                    {selectedHabit.customName || selectedHabit.category?.name}
                  </h4>
                  <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: "14px" }}>
                    Category: {selectedHabit.category?.name}
                  </p>
                  <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: "14px" }}>
                    Target: {selectedHabit.targetValue} {selectedHabit.category?.unit}
                  </p>
                  <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: "14px" }}>
                    Status: {selectedHabit.isActive ? "Active" : "Inactive"}
                  </p>

                  {(() => {
                    const todayLog = dashboardData?.todayLogs?.find(log => log.habitId === selectedHabit.id);
                    return (
                      <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#374151" }}>
                          Today's Progress
                        </p>
                        <p style={{ margin: 0, color: todayLog?.completed ? "#166534" : "#dc2626" }}>
                          {todayLog?.completed ? "✓ Completed" : "Not completed yet"}
                        </p>
                        {todayLog?.actualValue && (
                          <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>
                            Actual: {todayLog.actualValue} {selectedHabit.category?.unit}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#0f172a",
                }}
              >
                Progress Overview
              </h3>
              <MetricsChart title="Daily Completions" />
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#0f172a",
                }}
              >
                Quick Summary
              </h3>

              <p style={{ color: "#475569", lineHeight: "1.7" }}>
                {dashboardData?.completedToday > 0
                  ? `Great job! You've completed ${dashboardData.completedToday} habit${dashboardData.completedToday > 1 ? 's' : ''} today. Keep up the momentum!`
                  : "No habits completed today yet. Start building your streak by completing your first habit!"
                }
              </p>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#0f172a",
                }}
              >
                Weekly Goal
              </h3>

              <div
                style={{
                  height: "14px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: `${dashboardData?.completionRate || 0}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #22c55e, #15803d)",
                  }}
                />
              </div>

              <p style={{ margin: 0, color: "#475569" }}>
                {dashboardData?.completionRate || 0}% of your weekly goal completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}