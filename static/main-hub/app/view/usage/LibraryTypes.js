Ext.define('MainHub.view.usage.LibraryTypes', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'usagelibrarytypes',

  requires: [
    'MainHub.view.usage.ChartPolarBase',
    'MainHub.view.usage.ChartCartesianBase'
  ],

  title: 'Library Types',

  layout: {
    type: 'vbox',
    align: 'center'
  },

  height: 800,

  items: [
    {
      xtype: 'parkourpolar',
      store: 'UsageLibraryTypes',
      height: 365
    },
    {
      xtype: 'parkourcartesian',
      store: 'UsageLibraryTypes',
      height: 400
    }
  ]
});
