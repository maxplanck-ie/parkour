Ext.define('MainHub.model.enauploader.ENASamples', {
  extend: 'MainHub.model.Record',

  fields: [
    // Experiments
    {
      name: 'library_protocol',
      type: 'string'
    },
    {
      name: 'library_type',
      type: 'string'
    },
    {
      name: 'description',
      type: 'string'
    },
    {
      name: 'library_layout',
      type: 'string'
    },
    {
      name: 'mean_fragment_size',
      type: 'string'
    },
    {
      name: 'sequencer',
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
      name: 'library_source',
      type: 'string'
    },
    {
      name: 'library_selection',
      type: 'string'
    },
    {
      name: 'platform',
      type: 'string'
    }
  ]
});
