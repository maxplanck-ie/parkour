Ext.define('MainHub.view.startpage.Startpage', {
    extend: 'Ext.container.Container',
    xtype: 'startpage',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'MainHub.view.startpage.StartpageController',
        'MainHub.view.startpage.Requests',
        'MainHub.view.startpage.RequestsUser'
    ],

    controller: 'startpage',

    layout: 'responsivecolumn',

    initComponent: function() {
        var me = this;

        me.items = USER_IS_STAFF ? [{ xtype: 'requests' }] : [{ xtype: 'requests-user' }];

        me.callParent(arguments);
    }
});
