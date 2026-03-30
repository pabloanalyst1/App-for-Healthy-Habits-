-- Database Schema for HabitFlow
-- Lead: Great Bebia

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habit categories table
CREATE TABLE habit_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    unit VARCHAR(20), -- 'glasses', 'minutes', 'hours', 'meals', 'sessions'
    default_target INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User habits table (habits assigned to users)
CREATE TABLE user_habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES habit_categories(id) ON DELETE CASCADE,
    custom_name VARCHAR(200),
    target_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

-- Daily habit logs table
CREATE TABLE habit_logs (
    id SERIAL PRIMARY KEY,
    user_habit_id INTEGER REFERENCES user_habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    actual_value INTEGER, -- actual amount achieved (e.g., 8 glasses of water)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_habit_id, date)
);

-- Metrics table for detailed tracking
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES habit_categories(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL, -- flexible numeric value
    unit VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, date)
);

-- Insert default habit categories
INSERT INTO habit_categories (name, description, icon, unit, default_target) VALUES
('Daily Water Intake', 'Track daily water consumption', '💧', 'glasses', 8),
('Physical Activity', 'Track exercise and physical activity', '🏃', 'minutes', 30),
('Sleep Duration & Quality', 'Monitor sleep patterns', '😴', 'hours', 8),
('Healthy Eating', 'Track healthy meals and nutrition', '🥗', 'meals', 3),
('Mental Wellness', 'Track mindfulness and mental health activities', '🧘', 'sessions', 1);