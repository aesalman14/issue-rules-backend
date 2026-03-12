const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const ResponsibilityCategory = sequelize.define(
  'ResponsibilityCategory',
  {
    responsibilityCategoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'responsibility_category_id',
    },
    responsibilityCategory: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'responsibility_category',
    },
    responsibilityCategoryDescription: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'responsibility_category_description',
    },
  },
  {
    tableName: 'lookup_responsibility_categories',
    timestamps: false,
  }
);

module.exports = ResponsibilityCategory;
