const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Plant = sequelize.define(
  'Plant',
  {
    plantLookupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'plant_lookup_id',
    },
    dnPlantName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'dn_plant_name',
    },
    dnPlantId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'dn_plant_id',
    },
  },
  {
    tableName: 'lookup_plants',
    timestamps: false,
  }
);

module.exports = Plant;
