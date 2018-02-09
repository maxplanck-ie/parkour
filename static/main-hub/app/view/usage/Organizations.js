Ext.define('MainHub.view.usage.Organizations', {
  extend: 'MainHub.view.usage.ChartBase',
  xtype: 'usageorganizations',

  requires: [
    'MainHub.view.usage.ChartPolarBase'
  ],

  title: 'Organizations',

  items: [{
    xtype: 'parkourpolar',
    store: 'UsageOrganizations'
  }]
});
