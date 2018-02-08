Ext.define('MainHub.view.usage.PrincipalInvestigators', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'principalinvestigators',

  requires: [
    'MainHub.view.usage.ChartPolarBase'
  ],

  title: 'Principal Investigators',

  items: [{
    xtype: 'parkourpolar',

    store: {
      fields: ['name', 'data'],
      data: [
        {
          name: 'Akhtar',
          data: 300
        },
        {
          name: 'Boehm',
          data: 500
        },
        {
          name: 'Sawarkar',
          data: 22
        },
        {
          name: 'Iovino',
          data: 200
        },
        {
          name: 'Lassman',
          data: 2
        }
      ]
    }
  }]
});
