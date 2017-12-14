Ext.define('MainHub.view.invoicing.Invoicing', {
  extend: 'Ext.container.Container',
  xtype: 'invoicing',

  requires: [
    'MainHub.components.BaseGrid',
    'MainHub.view.invoicing.InvoicingController'
  ],

  controller: 'invoicing',

  anchor: '100% -1',
  layout: 'fit',

  items: [{
    xtype: 'basegrid',
    id: 'invoicing-grid',
    itemId: 'invoicing-grid',
    store: 'Invoicing',

    header: {
      title: 'Invoicing',
      height: 56
    },

    columns: {
      defaults: {
        minWidth: 200,
        flex: 1
      },
      items: [
        {
          text: 'Request',
          dataIndex: 'request'
        },
        {
          text: 'Cost Unit',
          dataIndex: 'cost_unit',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: 'Sequencer',
          dataIndex: 'sequencer',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: 'Date + Flowcell ID',
          dataIndex: 'flowcell',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: 'Pool',
          dataIndex: 'pool',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: '%',
          dataIndex: 'percentage',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: 'Read Length',
          dataIndex: 'read_length',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: '# of Libraries/Samples',
          dataIndex: 'num_libraries_samples',
          minWidth: 150
        },
        {
          text: 'Library Protocol',
          dataIndex: 'library_protocol',
          renderer: 'gridCellTooltipRenderer'
        },
        {
          text: 'Fixed Costs',
          dataIndex: 'fixed_costs',
          minWidth: 130
        },
        {
          text: 'Sequencing Costs',
          dataIndex: 'sequencing_costs',
          minWidth: 130
        },
        {
          text: 'Preparation Costs',
          dataIndex: 'preparation_costs',
          minWidth: 130
        },
        {
          text: 'Variable Costs',
          dataIndex: 'variable_costs',
          minWidth: 130
        },
        {
          text: 'Total Costs',
          dataIndex: 'total_costs',
          minWidth: 130
        }
      ]
    },

    plugins: [
      {
        ptype: 'bufferedrenderer',
        trailingBufferZone: 100,
        leadingBufferZone: 100
      }
    ],

    dockedItems: []
  }]
});
