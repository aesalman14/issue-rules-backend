'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'lookup_responsibility_categories'
    `);

    if (rows[0].total > 0) {
      return;
    }

    await queryInterface.createTable('lookup_responsibility_categories', {
      responsibility_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      responsibility_category: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      responsibility_category_description: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('lookup_responsibility_categories', ['responsibility_category'], {
      unique: true,
      name: 'ux_lookup_responsibility_category',
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `lookup_responsibility_categories`;');
  },
};
