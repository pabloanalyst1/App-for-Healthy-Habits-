const User = require('./User');
const HabitCategory = require('./HabitCategory');
const UserHabit = require('./UserHabit');
const HabitLog = require('./HabitLog');
const Metric = require('./Metric');

// Define associations
User.hasMany(UserHabit, { foreignKey: 'userId', as: 'habits' });
UserHabit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

HabitCategory.hasMany(UserHabit, { foreignKey: 'categoryId', as: 'userHabits' });
UserHabit.belongsTo(HabitCategory, { foreignKey: 'categoryId', as: 'category' });

UserHabit.hasMany(HabitLog, { foreignKey: 'userHabitId', as: 'logs' });
HabitLog.belongsTo(UserHabit, { foreignKey: 'userHabitId', as: 'userHabit' });

User.hasMany(Metric, { foreignKey: 'userId', as: 'metrics' });
Metric.belongsTo(User, { foreignKey: 'userId', as: 'user' });

HabitCategory.hasMany(Metric, { foreignKey: 'categoryId', as: 'metrics' });
Metric.belongsTo(HabitCategory, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  User,
  HabitCategory,
  UserHabit,
  HabitLog,
  Metric,
};