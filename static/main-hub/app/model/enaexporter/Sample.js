Ext.define('MainHub.model.enaexporter.Sample', {
  extend: 'MainHub.model.Base',

  fields: [
    // Common
    {
      name: 'status',
      type: 'string',
      defaultValue: 'add'
    },
    {
      name: 'accession',
      type: 'string',
      defaultValue: 'update_by_ENA'
    },
    {
      name: 'submission_date',
      type: 'string',
      defaultValue: 'update_by_ENA'
    },

    // Experiments
    {
      name: 'pk',
      type: 'int'
    },
    {
      name: 'barcode',
      type: 'string'
    },
    {
      name: 'library_name',
      type: 'string'
    },
    {
      name: 'library_strategy',
      type: 'string'
    },
    {
      name: 'design_description',
      type: 'string'
    },
    {
      name: 'library_source',
      type: 'string'
    },
    {
      name: 'library_selection',
      type: 'string'
    },
    {
      name: 'library_layout',
      type: 'string'
    },
    {
      name: 'insert_size',
      type: 'int',
      allowNull: true
    },
    {
      name: 'library_construction_protocol',
      type: 'string'
    },
    {
      name: 'platform',
      type: 'string',
      defaultValue: 'Illumina'
    },
    {
      name: 'instrument_model',
      type: 'string'
    },

    // Samples
    {
      name: 'scientific_name',
      type: 'string'
    },
    {
      name: 'taxon_id',
      type: 'int',
      allowNull: true
    },
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'sample_description',
      type: 'string'
    },

    // Runs
    {
      name: 'file_name',
      type: 'string'
    },
    {
      name: 'file_format',
      type: 'string'
    },
    {
      name: 'file_checksum',
      type: 'string',
      defaultValue: 'update_by_ENA'
    }
  ]
});
