const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Customer = sequelize.define(
  'Customer',
  {
    customerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'customer_id',
    },
    customerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'customer_name',
    },
  },
  {
    tableName: 'lookup_customers',
    timestamps: false,
  }
);

module.exports = Customer;
