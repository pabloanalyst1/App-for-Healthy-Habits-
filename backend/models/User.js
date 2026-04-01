const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      darkMode: false,
      notifications: true,
      language: 'en',
    },
  },
}, {
  timestamps: true,
});

module.exports = User;