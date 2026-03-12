const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const RuleOperand = sequelize.define(
  'RuleOperand',
  {
    ruleOperandId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'rule_operand_id',
    },
    operandValue: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'operand_value',
    },
    operandText: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'operand_text',
    },
  },
  {
    tableName: 'lookup_rule_operands',
    timestamps: false,
  }
);

module.exports = RuleOperand;
