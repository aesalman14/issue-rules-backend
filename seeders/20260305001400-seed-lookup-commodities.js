'use strict';

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(__dirname, '..', 'commodities.csv');

function normalize(value) {
  return (value || '').toString().trim();
}

function pickColumn(columns, candidates) {
  const lowerMap = new Map(columns.map((c) => [c.toLowerCase(), c]));
  for (const name of candidates) {
    const found = lowerMap.get(name.toLowerCase());
    if (found) return found;
  }
  return null;
}

module.exports = {
  async up(queryInterface) {
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`commodities.csv not found at ${CSV_PATH}`);
    }

    const csv = fs.readFileSync(CSV_PATH, 'utf8');
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const rows = parsed.data || [];
    const columns = parsed.meta?.fields || [];

    const productCol = pickColumn(columns, [
      'Product Description',
      'Product',
      'Product Name',
      'Commodity',
      'Commodity Name',
      'DN Product',
    ]);

    const dnPartCol = pickColumn(columns, [
      'DN Part ID',
      'DN PartID',
      'DN_Part_ID',
      'Part ID',
      'DNPID',
    ]);

    if (!productCol || !dnPartCol) {
      throw new Error(
        `commodities.csv must include product + DN Part ID columns. Found columns: ${columns.join(', ')}`
      );
    }

    const pgProductGroupCol = pickColumn(columns, ['PG Product Group']);
    const productFamilyCol = pickColumn(columns, ['Product Family']);
    const productGroupCol = pickColumn(columns, ['Product Group']);
    const productSubgroupCol = pickColumn(columns, ['Product Subgroup']);

    const byDnPart = new Map();

    for (const r of rows) {
      const productDescription = normalize(r[productCol]);
      const dnPartId = normalize(r[dnPartCol]);
      if (!productDescription || !dnPartId) continue;

      byDnPart.set(dnPartId, {
        product_name: productDescription,
        product_description: productDescription,
        pg_product_group: normalize(pgProductGroupCol ? r[pgProductGroupCol] : ''),
        product_family: normalize(productFamilyCol ? r[productFamilyCol] : ''),
        product_group: normalize(productGroupCol ? r[productGroupCol] : ''),
        product_subgroup: normalize(productSubgroupCol ? r[productSubgroupCol] : ''),
        dn_part_id: dnPartId,
      });
    }

    const normalizedRows = Array.from(byDnPart.values());

    if (normalizedRows.length === 0) {
      console.log('Skipping commodities seed: no valid rows in commodities.csv');
      return;
    }

    await queryInterface.bulkDelete('lookup_commodities', null, {});
    await queryInterface.bulkInsert('lookup_commodities', normalizedRows, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('lookup_commodities', null, {});
  },
};
