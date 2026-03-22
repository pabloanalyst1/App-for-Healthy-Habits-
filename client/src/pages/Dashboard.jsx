export default function Dashboard() {
  const habits = [
    { name: "Drink 2 liters of water", status: "Completed" },
    { name: "Walk 30 minutes", status: "In Progress" },
    { name: "Sleep 8 hours", status: "Pending" },
  ];

  const summaryCards = [ 
    { title: "Current Streak", value: "4 days" },
    { title: "Completion Rate", value: "75%" },
    { title: "Habits Completed", value: "6 / 8" },
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

          <button
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
        </div>

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
              {habits.map((habit) => (
                <div
                  key={habit.name}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#f8fafc",
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
                      {habit.name}
                    </h4>
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      Healthy routine task for today
                    </p>
                  </div>

                  <span
                    style={{
                      background:
                        habit.status === "Completed"
                          ? "#dcfce7"
                          : habit.status === "In Progress"
                          ? "#fef3c7"
                          : "#e5e7eb",
                      color:
                        habit.status === "Completed"
                          ? "#166534"
                          : habit.status === "In Progress"
                          ? "#92400e"
                          : "#374151",
                      padding: "8px 12px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {habit.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "grid", gap: "24px" }}>
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
                You are making steady progress this week. Keep completing your
                daily habits to increase your streak and consistency score.
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
                    width: "75%",
                    height: "100%",
                    background: "linear-gradient(90deg, #22c55e, #15803d)",
                  }}
                />
              </div>

              <p style={{ margin: 0, color: "#475569" }}>
                75% of your weekly goal completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}