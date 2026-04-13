import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle2,
  ListChecks,
  Settings2,
  Wrench,
  TimerReset,
  Calculator,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Info,
} from "lucide-react";
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
import { Input } from "../components/ui/input";

const DEFAULT_POMODORO_MINUTES = 25;

export default function Tools() {
  const navigate = useNavigate();
  const audioContextRef = useRef(null);
  const hasPlayedFinishSoundRef = useRef(false);

  const [profile, setProfile] = useState(null);

  const [pomodoroMinutes, setPomodoroMinutes] = useState(DEFAULT_POMODORO_MINUTES);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [macroForm, setMacroForm] = useState({
    weight: "",
    height: "",
    age: "",
    sex: "female",
    activity: "moderate",
    goal: "maintain",
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }

    const savedProfile = localStorage.getItem("healthyHabitsProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, [navigate]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0 && !hasPlayedFinishSoundRef.current) {
      playFinishSound();
      hasPlayedFinishSoundRef.current = true;
    }

    if (secondsLeft > 0) {
      hasPlayedFinishSoundRef.current = false;
    }
  }, [secondsLeft]);

  const playFinishSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator1.type = "sine";
      oscillator2.type = "triangle";

      oscillator1.frequency.setValueAtTime(880, now);
      oscillator2.frequency.setValueAtTime(1174, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + 0.7);
      oscillator2.stop(now + 0.7);
    } catch (error) {
      console.error("Unable to play finish sound:", error);
    }
  };

  const handlePomodoroMinutesChange = (event) => {
    const nextValue = Number.parseInt(event.target.value, 10);

    if (!Number.isInteger(nextValue) || nextValue <= 0) {
      setPomodoroMinutes("");
      setSecondsLeft(0);
      setIsRunning(false);
      return;
    }

    setPomodoroMinutes(nextValue);
    setSecondsLeft(nextValue * 60);
    setIsRunning(false);
    hasPlayedFinishSoundRef.current = false;
  };

  const handleStartPomodoro = () => {
    if (secondsLeft > 0) {
      setIsRunning(true);
    }
  };

  const handlePausePomodoro = () => {
    setIsRunning(false);
  };

  const handleResetPomodoro = () => {
    const validMinutes =
      Number.isInteger(Number(pomodoroMinutes)) && Number(pomodoroMinutes) > 0
        ? Number(pomodoroMinutes)
        : DEFAULT_POMODORO_MINUTES;

    setIsRunning(false);
    setSecondsLeft(validMinutes * 60);
    hasPlayedFinishSoundRef.current = false;
  };

  const formattedTime = useMemo(() => {
    const safeSeconds = Math.max(secondsLeft, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  const pomodoroProgress = useMemo(() => {
    const totalSeconds =
      Number.isInteger(Number(pomodoroMinutes)) && Number(pomodoroMinutes) > 0
        ? Number(pomodoroMinutes) * 60
        : DEFAULT_POMODORO_MINUTES * 60;

    if (totalSeconds <= 0) return 0;

    const completed = totalSeconds - secondsLeft;
    return Math.min(Math.max((completed / totalSeconds) * 100, 0), 100);
  }, [pomodoroMinutes, secondsLeft]);

  const handleMacroChange = (field, value) => {
    setMacroForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const macroResults = useMemo(() => {
    const weight = Number.parseFloat(macroForm.weight);
    const height = Number.parseFloat(macroForm.height);
    const age = Number.parseFloat(macroForm.age);

    if (
      !Number.isFinite(weight) ||
      !Number.isFinite(height) ||
      !Number.isFinite(age) ||
      weight <= 0 ||
      height <= 0 ||
      age <= 0
    ) {
      return null;
    }

    const isMale = macroForm.sex === "male";

    const bmr = isMale
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityMultipliers = {
      low: 1.2,
      light: 1.375,
      moderate: 1.55,
      high: 1.725,
    };

    const maintenanceCalories = bmr * activityMultipliers[macroForm.activity];

    const calorieAdjustment = {
      lose: -350,
      maintain: 0,
      gain: 300,
    };

    const targetCalories = Math.round(
      maintenanceCalories + calorieAdjustment[macroForm.goal]
    );

    const proteinGrams = Math.round(weight * 2);
    const fatGrams = Math.round(weight * 0.8);
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const carbGrams = Math.max(
      Math.round((targetCalories - proteinCalories - fatCalories) / 4),
      0
    );

    return {
      calories: targetCalories,
      protein: proteinGrams,
      carbs: carbGrams,
      fats: fatGrams,
    };
  }, [macroForm]);

  const macroInsight = useMemo(() => {
    if (!macroResults) return null;

    if (macroForm.goal === "lose") {
      return {
        title: "Fat loss recommendation",
        text: `This plan is set with a moderate calorie deficit to support fat loss while keeping protein high for muscle retention. Estimated target: ${macroResults.calories} kcal.`,
      };
    }

    if (macroForm.goal === "gain") {
      return {
        title: "Muscle gain recommendation",
        text: `This plan uses a calorie surplus to support muscle growth and recovery. Keep training consistently and prioritize protein intake. Estimated target: ${macroResults.calories} kcal.`,
      };
    }

    return {
      title: "Maintenance recommendation",
      text: `This plan is designed to help maintain your current weight while supporting energy, recovery, and daily performance. Estimated target: ${macroResults.calories} kcal.`,
    };
  }, [macroForm.goal, macroResults]);

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

  const isPomodoroComplete = secondsLeft === 0;

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

            <button
              className="sidebar-link"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
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

            <button className="sidebar-link active-link" type="button">
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
              <p>Use smart tools to support your focus and nutrition planning.</p>
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
            <button
              className="logout-button"
              type="button"
              onClick={() => {
                authService.logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="premium-top-bar">
            <div>
              <p className="topbar-kicker">Productivity & Nutrition</p>
              <h1>Tools Center</h1>
              <p className="topbar-description">
                Use focused utilities that support your healthy routine, study time,
                and daily planning.
              </p>
            </div>

            <div className="top-bar-actions">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>

          <div className="tools-grid">
            <Card className="panel-card premium-card panel-card-premium dashboard-lift-card tools-panel-card">
              <CardHeader className="panel-header tools-panel-header">
                <div className="panel-title-group">
                  <div className="panel-title-icon panel-title-icon-violet">
                    <TimerReset size={16} />
                  </div>
                  <div>
                    <CardTitle>Pomodoro Timer</CardTitle>
                    <CardDescription className="tools-card-description">
                      Stay focused with a simple countdown session.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={isPomodoroComplete ? "success" : "secondary"}>
                  {isPomodoroComplete ? "Session Complete" : "Focus Tool"}
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="tools-card-layout">
                  <div className="tools-form-block">
                    <label className="tools-label" htmlFor="pomodoro-minutes">
                      Session Length (minutes)
                    </label>
                    <Input
                      id="pomodoro-minutes"
                      type="number"
                      min="1"
                      step="1"
                      value={pomodoroMinutes}
                      onChange={handlePomodoroMinutesChange}
                      nativeInput
                    />
                  </div>

                  <div className="pomodoro-display-card">
                    <div className="pomodoro-display-top">
                      <span className="pomodoro-display-label">Time Remaining</span>
                      <span className="pomodoro-sound-indicator">
                        <Volume2 size={14} />
                        Sound Enabled
                      </span>
                    </div>

                    <strong className="pomodoro-display-time">{formattedTime}</strong>

                    <div className="pomodoro-progress-track">
                      <div
                        className="pomodoro-progress-fill"
                        style={{ width: `${pomodoroProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="tools-button-row">
                    <Button
                      type="button"
                      onClick={handleStartPomodoro}
                      disabled={isRunning || secondsLeft === 0}
                    >
                      <Play size={16} />
                      Start
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePausePomodoro}
                      disabled={!isRunning}
                    >
                      <Pause size={16} />
                      Pause
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResetPomodoro}
                    >
                      <RotateCcw size={16} />
                      Reset
                    </Button>
                  </div>

                  <p className="panel-text tools-helper-text">
                    Great for study sessions, reading blocks, or focused work cycles.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-card premium-card panel-card-premium dashboard-lift-card tools-panel-card">
              <CardHeader className="panel-header tools-panel-header">
                <div className="panel-title-group">
                  <div className="panel-title-icon panel-title-icon-blue">
                    <Calculator size={16} />
                  </div>
                  <div>
                    <CardTitle>Macro Calculator</CardTitle>
                    <CardDescription className="tools-card-description">
                      Estimate calories and daily macros for your nutrition plan.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="info">Nutrition Tool</Badge>
              </CardHeader>

              <CardContent>
                <div className="tools-card-layout">
                  <div className="form-row">
                    <div className="tools-form-block">
                      <label className="tools-label" htmlFor="macro-weight">
                        Weight (kg)
                      </label>
                      <Input
                        id="macro-weight"
                        type="number"
                        min="1"
                        step="0.1"
                        value={macroForm.weight}
                        onChange={(event) =>
                          handleMacroChange("weight", event.target.value)
                        }
                        nativeInput
                      />
                    </div>

                    <div className="tools-form-block">
                      <label className="tools-label" htmlFor="macro-height">
                        Height (cm)
                      </label>
                      <Input
                        id="macro-height"
                        type="number"
                        min="1"
                        step="0.1"
                        value={macroForm.height}
                        onChange={(event) =>
                          handleMacroChange("height", event.target.value)
                        }
                        nativeInput
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="tools-form-block">
                      <label className="tools-label" htmlFor="macro-age">
                        Age
                      </label>
                      <Input
                        id="macro-age"
                        type="number"
                        min="1"
                        step="1"
                        value={macroForm.age}
                        onChange={(event) =>
                          handleMacroChange("age", event.target.value)
                        }
                        nativeInput
                      />
                    </div>

                    <div className="tools-form-block">
                      <label className="tools-label" htmlFor="macro-sex">
                        Sex
                      </label>
                      <select
                        id="macro-sex"
                        className="tools-native-select"
                        value={macroForm.sex}
                        onChange={(event) =>
                          handleMacroChange("sex", event.target.value)
                        }
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="tools-form-block">
                      <label className="tools-label" htmlFor="macro-activity">
                        Activity Level
                      </label>
                      <select
                        id="macro-activity"
                        className="tools-native-select"
                        value={macroForm.activity}
                        onChange={(event) =>
                          handleMacroChange("activity", event.target.value)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="tools-form-block">
                      <label className="tools-label" htmlFor="macro-goal">
                        Goal
                      </label>
                      <select
                        id="macro-goal"
                        className="tools-native-select"
                        value={macroForm.goal}
                        onChange={(event) =>
                          handleMacroChange("goal", event.target.value)
                        }
                      >
                        <option value="lose">Lose Fat</option>
                        <option value="maintain">Maintain</option>
                        <option value="gain">Gain Muscle</option>
                      </select>
                    </div>
                  </div>

                  {macroResults ? (
                    <>
                      <div className="macro-results-grid">
                        <div className="macro-result-card">
                          <span>Calories</span>
                          <strong>{macroResults.calories}</strong>
                        </div>

                        <div className="macro-result-card">
                          <span>Protein (g)</span>
                          <strong>{macroResults.protein}</strong>
                        </div>

                        <div className="macro-result-card">
                          <span>Carbs (g)</span>
                          <strong>{macroResults.carbs}</strong>
                        </div>

                        <div className="macro-result-card">
                          <span>Fats (g)</span>
                          <strong>{macroResults.fats}</strong>
                        </div>
                      </div>

                      <div className="macro-insight-card">
                        <div className="macro-insight-title">
                          <Sparkles size={16} />
                          <strong>{macroInsight.title}</strong>
                        </div>
                        <p>{macroInsight.text}</p>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state tools-empty-state">
                      <div className="tools-empty-icon">
                        <Info size={18} />
                      </div>
                      <h4>Enter your data</h4>
                      <p>
                        Fill in your body data and goal to calculate an estimated macro plan.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}