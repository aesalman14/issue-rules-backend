const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Commodity = sequelize.define(
  'Commodity',
  {
    commodityLookupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'commodity_lookup_id',
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'product_name',
    },
    productDescription: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'product_description',
    },
    pgProductGroup: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'pg_product_group',
    },
    productFamily: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'product_family',
    },
    productGroup: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'product_group',
    },
    productSubgroup: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'product_subgroup',
    },
    dnPartId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'dn_part_id',
    },
  },
  {
    tableName: 'lookup_commodities',
    timestamps: false,
  }
);

module.exports = Commodity;
