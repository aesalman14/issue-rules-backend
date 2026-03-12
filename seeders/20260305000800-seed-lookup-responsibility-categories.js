'use strict';

const RESPONSIBILITY_CATEGORIES = [
  { responsibility_category: 'NTF', responsibility_category_description: 'No Trouble Found' },
  { responsibility_category: 'TBD', responsibility_category_description: 'To Be Determined' },
  { responsibility_category: 'TFCA', responsibility_category_description: 'Trouble Found Customer Assembly' },
  { responsibility_category: 'TFCD', responsibility_category_description: 'Trouble Found Customer Design' },
  { responsibility_category: 'TFDD', responsibility_category_description: 'Trouble Found DENSO Design' },
  { responsibility_category: 'TFDM', responsibility_category_description: 'Trouble Found DENSO Manufacturing' },
];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT responsibility_category FROM `lookup_responsibility_categories`'
    );

    const existingSet = new Set(existing.map((r) => r.responsibility_category));
    const rowsToInsert = RESPONSIBILITY_CATEGORIES.filter(
      (row) => !existingSet.has(row.responsibility_category)
    );

    if (rowsToInsert.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('lookup_responsibility_categories', rowsToInsert, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'lookup_responsibility_categories',
      {
        responsibility_category: RESPONSIBILITY_CATEGORIES.map((r) => r.responsibility_category),
      },
      {}
    );
  },
};
