Ext.define('MainHub.model.enauploader.Run', {
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
      name: 'experiment_alias',
      type: 'string'
    },
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
    },
    {
      name: 'submission_date',
      type: 'string',
      defaultValue: 'update_by_ENA'
    }
  ]
});
