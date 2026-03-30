const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserHabit = sequelize.define('UserHabit', {
  customName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  targetValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = UserHabit;