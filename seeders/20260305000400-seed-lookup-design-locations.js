'use strict';

const DESIGN_LOCATIONS = ['DIAM', 'DNJP', 'HDJP', 'KDJP', 'TICO'];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT design_location_name FROM `lookup_design_locations`'
    );

    const existingSet = new Set(existing.map((r) => r.design_location_name));
    const rowsToInsert = DESIGN_LOCATIONS
      .filter((name) => !existingSet.has(name))
      .map((name) => ({ design_location_name: name }));

    if (rowsToInsert.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('lookup_design_locations', rowsToInsert, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'lookup_design_locations',
      { design_location_name: DESIGN_LOCATIONS },
      {}
    );
  },
};
