'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('lookup_commodities');

    if (!table.product_description) {
      await queryInterface.addColumn('lookup_commodities', 'product_description', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!table.pg_product_group) {
      await queryInterface.addColumn('lookup_commodities', 'pg_product_group', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!table.product_family) {
      await queryInterface.addColumn('lookup_commodities', 'product_family', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }

    if (!table.product_group) {
      await queryInterface.addColumn('lookup_commodities', 'product_group', {
        type: Sequelize.STRING(150),
        allowNull: true,
      });
    }

    if (!table.product_subgroup) {
      await queryInterface.addColumn('lookup_commodities', 'product_subgroup', {
        type: Sequelize.STRING(150),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('lookup_commodities');

    if (table.product_subgroup) {
      await queryInterface.removeColumn('lookup_commodities', 'product_subgroup');
    }
    if (table.product_group) {
      await queryInterface.removeColumn('lookup_commodities', 'product_group');
    }
    if (table.product_family) {
      await queryInterface.removeColumn('lookup_commodities', 'product_family');
    }
    if (table.pg_product_group) {
      await queryInterface.removeColumn('lookup_commodities', 'pg_product_group');
    }
    if (table.product_description) {
      await queryInterface.removeColumn('lookup_commodities', 'product_description');
    }
  },
};
