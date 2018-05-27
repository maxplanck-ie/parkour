Ext.define('MainHub.model.enaexporter.Study', {
  extend: 'MainHub.model.Base',

  fields: [
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
      name: 'study_type',
      type: 'string'
    },
    {
      name: 'study_abstract',
      type: 'string'
    },
    {
      name: 'pubmed_id',
      type: 'string'
    },
    {
      name: 'submission_date',
      type: 'string',
      defaultValue: 'update_by_ENA'
    }
  ]
});
