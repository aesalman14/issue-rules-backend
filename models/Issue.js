const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

// Issue model
const Issue = sequelize.define('Issue', {
  issueId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  owner: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  customer: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  checksheetId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  majorIssueNo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customerTrackingNumbers: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comma separated',
  },
  bulletinNumbers: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comma separated',
  },
  productDescription: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  designLocation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  manfPlant: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  responsibility: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  progressUpdates: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  countermeasure: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  affectedVehicles: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dnShareRatio: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'DN Share Ratio (%)',
  },
  serviceContribution: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Service Contribution (%)',
  },
  failureRatio: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Failure Ratio (%)',
  },
}, {
  tableName: 'issues',
  timestamps: false,
});

module.exports = Issue;
