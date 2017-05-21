Ext.define('MainHub.view.flowcell.PoolInfoWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'MainHub.view.flowcell.PoolInfoWindowController'
    ],
    controller: 'flowcell-poolinfowindow',

    width: 800,
    height: 600,
    modal: true,
    resizable: false,
    layout: 'fit',

    items: [{
        xtype: 'grid',
        border: 0,
        viewConfig: {
            loadMask: false
        },
        sortableColumns: false,
        store: 'poolInfoStore',
        columns: [{
                text: 'Request',
                dataIndex: 'request',
                flex: 1
            },
            {
                text: 'Library',
                dataIndex: 'library',
                flex: 1
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                width: 90
            },
            {
                text: 'Library Preparation Protocol',
                dataIndex: 'protocol',
                flex: 1
            }
        ]
    }]
});
