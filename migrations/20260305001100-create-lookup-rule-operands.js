'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'lookup_rule_operands'
    `);

    if (rows[0].total > 0) {
      return;
    }

    await queryInterface.createTable('lookup_rule_operands', {
      rule_operand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      operand_value: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      operand_text: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('lookup_rule_operands', ['operand_value'], {
      unique: true,
      name: 'ux_lookup_rule_operands_operand_value',
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `lookup_rule_operands`;');
  },
};
