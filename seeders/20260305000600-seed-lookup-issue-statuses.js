'use strict';

const ISSUE_STATUSES = [
  'C/M Implemented',
  'Cause Identified',
  'Closed',
  'Cost Settlement',
  'Investigating',
  'Trend Watch',
];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT issue_status_name FROM `lookup_issue_statuses`'
    );

    const existingSet = new Set(existing.map((r) => r.issue_status_name));
    const rowsToInsert = ISSUE_STATUSES
      .filter((name) => !existingSet.has(name))
      .map((name) => ({ issue_status_name: name }));

    if (rowsToInsert.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('lookup_issue_statuses', rowsToInsert, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'lookup_issue_statuses',
      { issue_status_name: ISSUE_STATUSES },
      {}
    );
  },
};
