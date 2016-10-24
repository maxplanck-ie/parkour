Ext.define('MainHub.view.pooling.Pooling', {
    extend: 'Ext.container.Container',
    xtype: 'pooling',

    requires: [
        // 'Ext.ux.layout.ResponsiveColumn',
        'MainHub.view.pooling.PoolingController',
    ],

    controller: 'pooling',

    items: [
        {
            padding: 15
        }
    ]
});
