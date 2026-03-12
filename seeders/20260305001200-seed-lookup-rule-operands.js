'use strict';

const RULE_OPERANDS = [
  { operand_value: '<', operand_text: 'Less Than' },
  { operand_value: '<=', operand_text: 'Less Than Or Equal To' },
  { operand_value: '=', operand_text: 'Equals' },
  { operand_value: '= ""', operand_text: 'Is Empty' },
  { operand_value: '>', operand_text: 'Greater Than' },
  { operand_value: '>=', operand_text: 'Greater Than Or Equal To' },
  { operand_value: 'IS NULL', operand_text: 'Is Null' },
  { operand_value: 'LIKE', operand_text: 'Contains (*)' },
];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT operand_value FROM `lookup_rule_operands`'
    );

    const existingSet = new Set(existing.map((r) => r.operand_value));
    const rowsToInsert = RULE_OPERANDS.filter(
      (row) => !existingSet.has(row.operand_value)
    );

    if (rowsToInsert.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('lookup_rule_operands', rowsToInsert, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'lookup_rule_operands',
      { operand_value: RULE_OPERANDS.map((r) => r.operand_value) },
      {}
    );
  },
};
