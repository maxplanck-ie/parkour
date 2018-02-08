Ext.define('MainHub.view.usage.Usage', {
  extend: 'Ext.container.Container',
  xtype: 'usage',

  requires: [
    'MainHub.view.usage.Records',
    'MainHub.view.usage.Organizations',
    'MainHub.view.usage.PrincipalInvestigators',
    'MainHub.view.usage.LibraryTypes',
    'Ext.ux.layout.ResponsiveColumn'
  ],

  layout: 'responsivecolumn',

  items: [
    {
      xtype: 'usagerecords',
      userCls: 'big-50 small-100'
    },
    {
      xtype: 'organizations',
      userCls: 'big-50 small-100'
    },
    {
      xtype: 'principalinvestigators',
      userCls: 'big-50 small-100'
    },
    {
      xtype: 'librarytypes',
      userCls: 'big-50 small-100'
    }
  ]
});
