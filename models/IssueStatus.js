const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const IssueStatus = sequelize.define(
  'IssueStatus',
  {
    issueStatusId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'issue_status_id',
    },
    issueStatusName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'issue_status_name',
    },
  },
  {
    tableName: 'lookup_issue_statuses',
    timestamps: false,
  }
);

module.exports = IssueStatus;
