'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'lookup_plants'
    `);

    if (rows[0].total > 0) {
      return;
    }

    await queryInterface.createTable('lookup_plants', {
      plant_lookup_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      dn_plant_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      dn_plant_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('lookup_plants', ['dn_plant_id'], {
      unique: true,
      name: 'ux_lookup_plants_dn_plant_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `lookup_plants`;');
  },
};
