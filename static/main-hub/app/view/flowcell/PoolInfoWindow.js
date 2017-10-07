Ext.define('MainHub.view.flowcell.PoolInfoWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'MainHub.view.flowcell.PoolInfoWindowController'
    ],
    controller: 'flowcell-poolinfowindow',

    width: 550,
    height: 650,
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
        enableColumnMove: false,
        enableColumnResize: false,
        enableColumnHide: false,
        store: 'poolInfoStore',
        columns: [{
                text: 'Request',
                dataIndex: 'request',
                flex: 1
            },
            {
                text: 'Library',
                dataIndex: 'name',
                flex: 1
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                width: 95,
                renderer: function(value) {
                    var record = Ext.getStore('poolInfoStore').findRecord('barcode', value);
                    return record ? record.getBarcode() : value;
                }
            },
            {
                text: 'Library Preparation Protocol',
                dataIndex: 'protocol',
                flex: 1
            }
        ]
    }]
});
