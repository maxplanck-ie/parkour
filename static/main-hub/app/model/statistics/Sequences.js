Ext.define('MainHub.model.statistics.Sequences', {
  extend: 'MainHub.model.Base',

  fields: [
    {
      name: 'request',
      type: 'string'
    },
    {
      name: 'barcode',
      type: 'string'
    },
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'fast_qc_r1',
      type: 'string'
    },
    {
      name: 'fast_qc_r2',
      type: 'string'
    },
    {
      name: 'sequencer',
      type: 'string'
    },
    {
      name: 'flowcell',
      type: 'string'
    },
    {
      name: 'lane',
      type: 'string'
    },
    {
      name: 'pool',
      type: 'string'
    },
    {
      name: 'library_protocol',
      type: 'string'
    },
    {
      name: 'library_type',
      type: 'string'
    },

    {
      name: 'confident_reads',
      type: 'float',
      allowNull: true
    },
    {
      name: 'contamination_report',
      type: 'string'
    },
    {
      name: 'percentage_read_pairs_unique',
      type: 'float',
      allowNull: true
    },
    {
      name: 'percentage_read_pairs_duplicates',
      type: 'float',
      allowNull: true
    },
    {
      name: 'percentage_optical_duplicates',
      type: 'float',
      allowNull: true
    },
    {
      name: 'percentage_uniquely_mapped',
      type: 'float',
      allowNull: true
    },
    {
      name: 'percentage_multiple_mapped',
      type: 'float',
      allowNull: true
    },
    {
      name: 'unmapped',
      type: 'float',
      allowNull: true
    },
    {
      name: 'insert_size',
      type: 'float',
      allowNull: true
    },
    {
      name: 'frip_score',
      type: 'float',
      allowNull: true
    }
  ]
});
