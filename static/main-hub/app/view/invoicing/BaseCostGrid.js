Ext.define('MainHub.view.invoicing.BaseCostGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.costgrid',

  viewConfig: {
    stripeRows: false
  },

  // sortableColumns: false,
  enableColumnMove: false,
  enableColumnHide: false,
  enableColumnResize: false,

  columns: [
    {
      text: 'Name',
      dataIndex: 'name',
      renderer: 'gridCellTooltipRenderer',
      flex: 1
    },
    {
      text: 'Price',
      dataIndex: 'price',
      renderer: Ext.util.Format.deMoney,
      editor: {
        xtype: 'numberfield',
        minValue: 0
      },
      width: 100
    }
  ],

  plugins: [
    {
      ptype: 'rowediting',
      clicksToEdit: 1
    }
  ]
});
