Ext.define('MainHub.view.usage.Usage', {
  extend: 'Ext.container.Container',
  xtype: 'usage',

  requires: [
    'MainHub.view.usage.UsageController',
    'MainHub.view.usage.Records',
    'MainHub.view.usage.Organizations',
    'MainHub.view.usage.PrincipalInvestigators',
    'MainHub.view.usage.LibraryTypes',
    'Ext.ux.layout.ResponsiveColumn'
  ],

  controller: 'usage',

  layout: 'responsivecolumn',

  items: [
    {
      xtype: 'usagerecords',
      userCls: 'big-50 small-100'
    },
    {
      xtype: 'usageorganizations',
      userCls: 'big-50 small-100'
    },
    {
      xtype: 'usageprincipalinvestigators',
      userCls: 'big-50 small-100'
    },
    {
      xtype: 'usagelibrarytypes',
      userCls: 'big-50 small-100'
    }
  ]
});
