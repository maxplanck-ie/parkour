Ext.define('MainHub.view.usage.PrincipalInvestigators', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'usageprincipalinvestigators',

  requires: [
    'MainHub.view.usage.ChartPolarBase',
    'MainHub.view.usage.ChartCartesianBase'
  ],

  title: 'Principal Investigators',

  layout: {
    type: 'vbox',
    align: 'center'
  },

  height: 800,

  items: [
    {
      xtype: 'parkourpolar',
      store: 'UsagePrincipalInvestigators',
      height: 365
    },
    {
      xtype: 'parkourcartesian',
      store: 'UsagePrincipalInvestigators',
      height: 400
    }
  ]
});
