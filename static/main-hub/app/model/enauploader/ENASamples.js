Ext.define('MainHub.model.enauploader.ENASamples', {
  extend: 'MainHub.model.Record',

  fields: [
    // Experiments
    {
      name: 'alias',
      type: 'string'
    },
    {
      name: 'status',
      type: 'string'
    },
    {
      name: 'accession',
      type: 'string',
      defaultValue: 'update_by_ENA'
    },
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'study_alias',
      type: 'string'
    },
    {
      name: 'sample_alias',
      type: 'string'
    },
    {
      name: 'design_description',
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
      type: 'number',
      allowNull: true
    },
    {
      name: 'library_construction_protocol',
      type: 'string'
    },
    {
      name: 'platform',
      type: 'string'
    },
    {
      name: 'instrument_model',
      type: 'string'
    },
    {
      name: 'submission_date',
      type: 'string',
      defaultValue: 'update_by_ENA'
    }
  ]
});
