Ext.define('MainHub.model.enaexporter.Sample', {
  extend: 'MainHub.model.Base',

  fields: [
    {
      name: 'barcode',
      type: 'string'
    },
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
      name: 'scientific_name',
      type: 'string'
    },
    {
      name: 'taxon_id',
      type: 'string'
    },
    {
      name: 'sample_description',
      type: 'string'
    },
    {
      name: 'submission_date',
      type: 'string',
      defaultValue: 'update_by_ENA'
    }
  ]
});
