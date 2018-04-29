Ext.define('MainHub.view.enauploader.ENABaseGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.enabasegrid',

  sortableColumns: false,
  enableColumnMove: false,
  enableColumnHide: false,

  viewConfig: {
    stripeRows: false
  },

  selModel: {
    type: 'spreadsheet',
    rowSelect: false
  },

  store: 'ENASamples',

  plugins: [
    {
      ptype: 'cellediting',
      clicksToEdit: 1
    },
    {
      ptype: 'clipboard'
    }
  ]
});
