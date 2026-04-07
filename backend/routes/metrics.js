const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, HabitCategory, UserHabit, HabitLog, Metric } = require('../models');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's habit categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await HabitCategory.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add a habit category (for seeding)
router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description, icon, unit, defaultTarget } = req.body;

    const category = await HabitCategory.create({
      name,
      description,
      icon,
      unit,
      defaultTarget,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Get user's habits
router.get('/habits', authenticateToken, async (req, res) => {
  try {
    const habits = await UserHabit.findAll({
      where: { userId: req.user.id },
      include: [
        { model: HabitCategory, as: 'category' }
      ]
    });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Add a habit for user
router.post('/habits', authenticateToken, async (req, res) => {
  try {
    const { categoryId, customName, targetValue } = req.body;

    const habit = await UserHabit.create({
      userId: req.user.id,
      categoryId,
      customName,
      targetValue,
    });

    const habitWithCategory = await UserHabit.findByPk(habit.id, {
      include: [{ model: HabitCategory, as: 'category' }]
    });

    res.status(201).json(habitWithCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// Log habit completion
router.post('/habits/:habitId/log', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const { date, completed, actualValue, notes } = req.body;

    // Verify habit belongs to user
    const habit = await UserHabit.findOne({
      where: { id: habitId, userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const log = await HabitLog.upsert({
      userHabitId: habitId,
      date,
      completed,
      actualValue,
      notes,
    });

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log habit' });
  }
});

// Get habit logs for a date range
router.get('/habits/:habitId/logs', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify habit belongs to user
    const habit = await UserHabit.findOne({
      where: { id: habitId, userId: req.user.id }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const logs = await HabitLog.findAll({
      where: {
        userHabitId: habitId,
        date: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Add metric data
router.post('/metrics', authenticateToken, async (req, res) => {
  try {
    const { categoryId, date, value, unit, notes } = req.body;

    const metric = await Metric.upsert({
      userId: req.user.id,
      categoryId,
      date,
      value,
      unit,
      notes,
    });

    res.json(metric);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save metric' });
  }
});

// Get metrics for a date range
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    const whereClause = {
      userId: req.user.id,
      date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const metrics = await Metric.findAll({
      where: whereClause,
      include: [{ model: HabitCategory, as: 'category' }],
      order: [['date', 'ASC']]
    });

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekStart = weekAgo.toISOString().split('T')[0];

    // 1. Get active habits count
    const activeHabits = await UserHabit.count({ where: { userId, isActive: true } });

    // 2. Get today's logs
    const todayLogs = await HabitLog.findAll({
      where: { date: today },
      include: [{ model: UserHabit, as: 'userHabit', where: { userId }, required: true }]
    });

    // 3. Get last 7 days of logs for the Chart
    const weekLogs = await HabitLog.findAll({
      where: { date: { [require('sequelize').Op.between]: [weekStart, today] } },
      include: [{ model: UserHabit, as: 'userHabit', where: { userId }, required: true }],
      order: [['date', 'ASC']]
    });

    // 4. Group logs by date so the chart isn't empty on missing days
    const statsMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      statsMap.set(d.toISOString().split('T')[0], 0);
    }

    weekLogs.forEach(log => {
      // Fix: Check if log.date is already a string or needs conversion
      const dateKey = typeof log.date === 'string' ? log.date : log.date.toISOString().split('T')[0];
      if (log.completed && statsMap.has(dateKey)) {
        statsMap.set(dateKey, statsMap.get(dateKey) + 1);
      }
    });

    const weeklyStats = Array.from(statsMap.entries())
      .map(([date, completed]) => ({ date, completed }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Send the fixed response
    res.json({
      activeHabits: activeHabits || 0,
      completedToday: todayLogs.filter(l => l.completed).length,
      currentStreak: 0, // Simplified to prevent crashes for now
      completionRate: 0,
      weeklyStats, // The Chart finally gets its data
      todayLogs: todayLogs.map(log => ({
        id: log.id,
        habitId: log.userHabitId,
        category: log.userHabit?.category?.name || 'Unknown',
        completed: log.completed || false
      }))
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;