const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
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

const HABIT_INCLUDE = [{ model: HabitCategory, as: 'category' }];

const normalizeHabitName = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? null : trimmedValue;
};

const parseHabitTarget = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const findUserHabit = (habitId, userId) =>
  UserHabit.findOne({
    where: { id: habitId, userId },
    include: HABIT_INCLUDE,
  });

const handleHabitPersistenceError = (error, res, fallbackMessage) => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'You already have a habit for this category.' });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage });
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
      include: HABIT_INCLUDE,
      order: [['createdAt', 'DESC']],
    });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Add a habit for user
router.post('/habits', authenticateToken, async (req, res) => {
  try {
    const { categoryId, customName, targetValue, isActive } = req.body;
    const parsedCategoryId = Number.parseInt(categoryId, 10);
    const parsedTargetValue = parseHabitTarget(targetValue);

    if (!Number.isInteger(parsedCategoryId)) {
      return res.status(400).json({ error: 'A valid habit category is required.' });
    }

    if (!parsedTargetValue) {
      return res.status(400).json({ error: 'Target value must be greater than 0.' });
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, 'isActive') &&
      typeof isActive !== 'boolean'
    ) {
      return res.status(400).json({ error: 'Habit status must be either active or inactive.' });
    }

    const category = await HabitCategory.findByPk(parsedCategoryId);
    if (!category) {
      return res.status(404).json({ error: 'Habit category not found.' });
    }

    const habit = await UserHabit.create({
      userId: req.user.id,
      categoryId: parsedCategoryId,
      customName: normalizeHabitName(customName),
      targetValue: parsedTargetValue,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    const habitWithCategory = await UserHabit.findByPk(habit.id, {
      include: HABIT_INCLUDE,
    });

    res.status(201).json(habitWithCategory);
  } catch (error) {
    handleHabitPersistenceError(error, res, 'Failed to create habit');
  }
});

// Update an existing habit
router.patch('/habits/:habitId', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const habit = await findUserHabit(habitId, req.user.id);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, 'categoryId')) {
      const parsedCategoryId = Number.parseInt(req.body.categoryId, 10);

      if (!Number.isInteger(parsedCategoryId)) {
        return res.status(400).json({ error: 'A valid habit category is required.' });
      }

      const category = await HabitCategory.findByPk(parsedCategoryId);
      if (!category) {
        return res.status(404).json({ error: 'Habit category not found.' });
      }

      updates.categoryId = parsedCategoryId;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'customName')) {
      updates.customName = normalizeHabitName(req.body.customName);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'targetValue')) {
      const parsedTargetValue = parseHabitTarget(req.body.targetValue);

      if (!parsedTargetValue) {
        return res.status(400).json({ error: 'Target value must be greater than 0.' });
      }

      updates.targetValue = parsedTargetValue;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'isActive')) {
      if (typeof req.body.isActive !== 'boolean') {
        return res.status(400).json({ error: 'Habit status must be either active or inactive.' });
      }

      updates.isActive = req.body.isActive;
    }

    await habit.update(updates);

    const updatedHabit = await UserHabit.findByPk(habit.id, {
      include: HABIT_INCLUDE,
    });

    res.json(updatedHabit);
  } catch (error) {
    handleHabitPersistenceError(error, res, 'Failed to update habit');
  }
});

// Delete an existing habit
router.delete('/habits/:habitId', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const habit = await UserHabit.findOne({
      where: { id: habitId, userId: req.user.id },
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await habit.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete habit', error);
    res.status(500).json({ error: 'Failed to delete habit' });
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
          [Op.between]: [startDate, endDate]
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
        [Op.between]: [startDate, endDate]
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
      where: { date: { [Op.between]: [weekStart, today] } },
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
