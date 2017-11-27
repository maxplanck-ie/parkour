Ext.define('MainHub.view.flowcell.PoolInfoWindow', {
  extend: 'Ext.window.Window',
  requires: [
    'MainHub.view.flowcell.PoolInfoWindowController'
  ],

  controller: 'flowcell-poolinfowindow',

  width: 550,
  height: 650,
  modal: true,
  autoShow: true,
  layout: 'fit',

  items: [{
    xtype: 'grid',
    border: 0,
    viewConfig: {
      loadMask: false,
      stripeRows: false
    },
    sortableColumns: false,
    enableColumnMove: false,
    enableColumnHide: false,
    store: 'poolInfoStore',
    columns: [
      {
        text: 'Request',
        dataIndex: 'request_name',
        flex: 1
      },
      {
        text: 'Library',
        dataIndex: 'name',
        flex: 1
      },
      {
        text: 'Barcode',
        dataIndex: 'barcode',
        resizable: false,
        width: 95,
        renderer: function (value, meta) {
          return meta.record.getBarcode();
        }
      },
      {
        text: 'Library Protocol',
        dataIndex: 'protocol_name',
        flex: 1,
        renderer: function (value, meta) {
          meta.tdAttr = Ext.String.format('data-qtip="{0}"', value);
          return value;
        }
      }]
  }]
});
