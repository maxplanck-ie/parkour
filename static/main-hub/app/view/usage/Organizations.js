Ext.define('MainHub.view.usage.Organizations', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'organizations',

  requires: [
    'MainHub.view.usage.ChartPolarBase'
  ],

  title: 'Organizations',

  items: [{
    xtype: 'parkourpolar',

    store: {
      fields: ['name', 'data'],
      data: [
        {
          name: 'MPI-IE',
          data: 100
        },
        {
          name: 'MEDEP',
          data: 20
        }
      ]
    }
  }]
});
