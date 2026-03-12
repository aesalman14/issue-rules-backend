'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'lookup_commodities'
    `);

    if (rows[0].total > 0) {
      return;
    }

    await queryInterface.createTable('lookup_commodities', {
      commodity_lookup_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      dn_part_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('lookup_commodities', ['product_name'], {
      name: 'ix_lookup_commodities_product_name',
    });

    await queryInterface.addIndex('lookup_commodities', ['product_name', 'dn_part_id'], {
      unique: true,
      name: 'ux_lookup_commodities_product_dn_part',
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `lookup_commodities`;');
  },
};
