'use strict';

const PLANTS = [
  { dn_plant_name: 'AFCO', dn_plant_id: 'AFCO' },
  { dn_plant_name: 'AIMS(DPAM)', dn_plant_id: 'AIMS(DPAM)' },
  { dn_plant_name: 'AINE', dn_plant_id: 'AINE' },
  { dn_plant_name: 'AMI', dn_plant_id: 'AMI' },
  { dn_plant_name: 'AMX', dn_plant_id: 'AMX' },
  { dn_plant_name: 'ANC', dn_plant_id: 'ANC' },
  { dn_plant_name: 'ASKY', dn_plant_id: 'ASKY-TAC' },
  { dn_plant_name: 'ASMI', dn_plant_id: 'ASMI-TAC' },
  { dn_plant_name: 'ASMX', dn_plant_id: 'ASMX' },
  { dn_plant_name: 'D_TK', dn_plant_id: 'D_TK' },
  { dn_plant_name: 'DIAM', dn_plant_id: 'DIAM' },
  { dn_plant_name: 'DMAR', dn_plant_id: 'DMAR' },
  { dn_plant_name: 'DMAT', dn_plant_id: 'DMAT' },
  { dn_plant_name: 'DMAT', dn_plant_id: 'DMAT-CP' },
  { dn_plant_name: 'DMAT', dn_plant_id: 'DMAT-FI' },
  { dn_plant_name: 'DMCF', dn_plant_id: 'DMCF' },
  { dn_plant_name: 'DMCN', dn_plant_id: 'DMCN' },
  { dn_plant_name: 'DMHU', dn_plant_id: 'DMHU' },
  { dn_plant_name: 'DMMI', dn_plant_id: 'DMMI' },
  { dn_plant_name: 'DMMI', dn_plant_id: 'DMMI-ARMAS' },
  { dn_plant_name: 'DMMI', dn_plant_id: 'DMMI-DLCA' },
  { dn_plant_name: 'DMMI', dn_plant_id: 'DMMI-GDC' },
  { dn_plant_name: 'DMMI', dn_plant_id: 'DMMI-USUI' },
  { dn_plant_name: 'DMNS', dn_plant_id: 'DMNS' },
  { dn_plant_name: 'DMNX', dn_plant_id: 'DMNX' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN-101' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN-201' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN-202' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN-203' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN-204' },
  { dn_plant_name: 'DMTN', dn_plant_id: 'DMTN-Warehouse' },
  { dn_plant_name: 'DMVN', dn_plant_id: 'DMVN' },
  { dn_plant_name: 'DMWX', dn_plant_id: 'DMWX' },
  { dn_plant_name: 'DNBA', dn_plant_id: 'DNBA' },
  { dn_plant_name: 'DNIA', dn_plant_id: 'DNIA' },
  { dn_plant_name: 'DNIN', dn_plant_id: 'DNIN' },
  { dn_plant_name: 'DNJP', dn_plant_id: 'DNJP' },
  { dn_plant_name: 'DNJP', dn_plant_id: 'DNJP-AN' },
  { dn_plant_name: 'DNJP', dn_plant_id: 'DNJP-ASMO' },
  { dn_plant_name: 'DNJP', dn_plant_id: 'DNJP-DA' },
  { dn_plant_name: 'DNJP', dn_plant_id: 'DNJP-HM' },
  { dn_plant_name: 'DNKR', dn_plant_id: 'DNKR' },
  { dn_plant_name: 'DNMN', dn_plant_id: 'DNMN' },
  { dn_plant_name: 'DNMX', dn_plant_id: 'DNMX' },
  { dn_plant_name: 'DNMX', dn_plant_id: 'DNMX-A' },
  { dn_plant_name: 'DNMX', dn_plant_id: 'DNMX-G' },
  { dn_plant_name: 'DNMX', dn_plant_id: 'DNMX-K' },
  { dn_plant_name: 'DNMX', dn_plant_id: 'DNMX-S' },
  { dn_plant_name: 'DNMY', dn_plant_id: 'DNMY' },
  { dn_plant_name: 'DNTH', dn_plant_id: 'DNTH' },
  { dn_plant_name: 'DNTS', dn_plant_id: 'DNTS' },
  { dn_plant_name: 'DNTW', dn_plant_id: 'DNTW' },
  { dn_plant_name: 'DSCA(DPAM)', dn_plant_id: 'DSCA(DPAM)' },
  { dn_plant_name: 'DWAM', dn_plant_id: 'DWAM' },
  { dn_plant_name: 'FPI', dn_plant_id: 'FPI' },
  { dn_plant_name: 'GCDN(Kunshan)', dn_plant_id: 'GCDN(Kunshan)' },
  { dn_plant_name: 'GNC', dn_plant_id: 'GNC' },
  { dn_plant_name: 'HDMX', dn_plant_id: 'HDMX' },
  { dn_plant_name: 'HDVN', dn_plant_id: 'HDVN' },
  { dn_plant_name: 'J.DEUS', dn_plant_id: 'J.DEUS' },
  { dn_plant_name: 'KDMK', dn_plant_id: 'KDMK' },
  { dn_plant_name: 'MACI', dn_plant_id: 'MACI' },
  { dn_plant_name: 'NAPS', dn_plant_id: 'NAPS' },
  { dn_plant_name: 'NAPS', dn_plant_id: 'NAPS-DLNT' },
  { dn_plant_name: 'NAPS', dn_plant_id: 'NAPS-DLTN' },
  { dn_plant_name: 'Other', dn_plant_id: 'Other' },
  { dn_plant_name: 'Other', dn_plant_id: 'Other-MMNA' },
  { dn_plant_name: 'Other', dn_plant_id: 'Other-Non-DENSO' },
  { dn_plant_name: 'SDM', dn_plant_id: 'SDM' },
  { dn_plant_name: 'SPD', dn_plant_id: 'SPD' },
  { dn_plant_name: 'TACG', dn_plant_id: 'TACG' },
  { dn_plant_name: 'TACI', dn_plant_id: 'TACI' },
  { dn_plant_name: 'TBDN', dn_plant_id: 'TBDN' },
  { dn_plant_name: 'WEASTEC', dn_plant_id: 'WEASTEC' },
  { dn_plant_name: 'YSD', dn_plant_id: 'YSD' },
];

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      'SELECT dn_plant_id FROM `lookup_plants`'
    );

    const existingSet = new Set(existing.map((r) => r.dn_plant_id));
    const rowsToInsert = PLANTS.filter((row) => !existingSet.has(row.dn_plant_id));

    if (rowsToInsert.length === 0) {
      return;
    }

    await queryInterface.bulkInsert('lookup_plants', rowsToInsert, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'lookup_plants',
      { dn_plant_id: PLANTS.map((r) => r.dn_plant_id) },
      {}
    );
  },
};
