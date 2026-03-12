const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

// IssueRule model for the rule logic rows
const IssueRule = sequelize.define('IssueRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  logicId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'e.g., 2859.1, 2859.2',
  },
  issueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Foreign key to Issue table',
  },
  ruleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  logicNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  column: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g., Customer, Model Year, Datalink, Claim Category, Issue ID',
  },
  operator: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g., Equals, Contains (*)',
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  logicOperator: {
    type: DataTypes.ENUM('And', 'Or'),
    defaultValue: 'And',
    comment: 'Logical operator to combine with next rule',
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this rule is active/enabled',
  },
}, {
  tableName: 'issue_rules',
  timestamps: false,
  indexes: [
    { fields: ['issueId'] },
    { fields: ['ruleId'] },
  ],
});

module.exports = IssueRule;
