Ext.define('MainHub.view.flowcell.PoolInfoWindowController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.flowcell-poolinfowindow',

  config: {
    control: {
      '#': {
        boxready: 'loadInfo'
      }
    }
  },

  loadInfo: function (wnd) {
    Ext.getStore('poolInfoStore').load({
      url: Ext.String.format('api/pools/{0}/', wnd.poolId)
    });
  }
});
