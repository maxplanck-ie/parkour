Ext.define('MainHub.model.invoicing.Request', {
  extend: 'MainHub.model.Base',

  fields: [
    {
      name: 'request',
      type: 'string'
    },
    {
      name: 'cost_unit',
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
      name: 'pool',
      type: 'string'
    },
    {
      name: 'percentage',
      type: 'string'
    },
    {
      name: 'read_length',
      type: 'string'
    },
    {
      name: 'num_libraries_samples',
      type: 'string'
    },
    {
      name: 'library_protocol',
      type: 'string'
    },
    {
      name: 'fixed_costs',
      type: 'float'
    },
    {
      name: 'sequencing_costs',
      type: 'float'
    },
    {
      name: 'preparation_costs',
      type: 'float'
    },
    {
      name: 'variable_costs',
      type: 'float'
    },
    {
      name: 'total_costs',
      type: 'float'
    }
  ]
});
