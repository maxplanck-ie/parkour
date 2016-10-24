Ext.define('MainHub.view.pooling.Pooling', {
    extend: 'Ext.container.Container',
    xtype: 'pooling',

    requires: [
        // 'Ext.ux.layout.ResponsiveColumn',
        'MainHub.view.pooling.PoolingController',
    ],

    controller: 'pooling',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    padding: 15,

    defaultType: 'panel',
    items: [
        {
            title: 'Libraries for Pooling',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 2,
            margin: '0 15px 0 0',

            items: [
                {
                    html: 'Container 1',
                    border: 0,
                    padding: 15
                }
            ]
        },
        {
            title: 'Graphical Representation',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1,

            items: [{
                html: 'Container 2',
                border: 0,
                padding: 15
            }]
        }
    ]
});
