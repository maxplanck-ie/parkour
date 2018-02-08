Ext.define('MainHub.view.usage.Records', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'usagerecords',

  requires: [
    'MainHub.view.usage.ChartPolarBase'
  ],

  title: 'Libraries & Samples',
  // iconCls: 'x-fa fa-pie-chart',

  items: [{
    xtype: 'parkourpolar',

    store: {
      fields: ['name', 'data'],
      data: [
        {
          name: 'Libraries',
          data: 14
        },
        {
          name: 'Samples',
          data: 16
        }
      ]
    }
  }]
});
