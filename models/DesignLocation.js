const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const DesignLocation = sequelize.define(
  'DesignLocation',
  {
    designLocationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'design_location_id',
    },
    designLocationName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'design_location_name',
    },
  },
  {
    tableName: 'lookup_design_locations',
    timestamps: false,
  }
);

module.exports = DesignLocation;
