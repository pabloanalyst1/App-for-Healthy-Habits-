const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HabitLog = sequelize.define('HabitLog', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  actualValue: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = HabitLog;