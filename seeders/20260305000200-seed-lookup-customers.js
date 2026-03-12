'use strict';

const CUSTOMER_NAMES = [
  'Ford',
  'GM',
  'Honda',
  'Nissan',
  'Stellantis',
  'Subaru',
  'Toyota',
];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT customer_name FROM `lookup_customers`'
    );

    const existingSet = new Set(existing.map((r) => r.customer_name));
    const rowsToInsert = CUSTOMER_NAMES
      .filter((name) => !existingSet.has(name))
      .map((name) => ({ customer_name: name }));

    if (rowsToInsert.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('lookup_customers', rowsToInsert, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'lookup_customers',
      { customer_name: CUSTOMER_NAMES },
      {}
    );
  },
};
