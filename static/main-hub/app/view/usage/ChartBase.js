Ext.define('MainHub.view.usage.ChartBase', {
  extend: 'Ext.Panel',

  cls: 'shadow',

  height: 400,
  ui: 'light',
  layout: 'fit',

  // headerPosition: 'bottom',

  defaults: {
    width: '100%'
  },

  tools: [{
    type: 'print',
    handler: function () {
      var panel = this.up('panel');
      var chart = panel.down('polar');
      if (chart) {
        chart.download({
          filename: panel.title
        });
      }
    }
  }]
});
