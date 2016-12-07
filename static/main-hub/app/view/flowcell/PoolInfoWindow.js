Ext.define('MainHub.view.flowcell.PoolInfoWindow',{
    extend: 'Ext.window.Window',

    requires: [
        'MainHub.view.flowcell.PoolInfoWindowController'
    ],

    controller: 'flowcell-poolinfowindow',

    width: 500,
    height: 350,

    modal: true,
    resizable: false,
    layout: 'fit',

    items: [{
        xtype: 'grid',
        border: 0,
        store: 'poolInfoStore',
        columns: [
            { text: 'Request', dataIndex: 'request', flex: 1 },
            { text: 'Library', dataIndex: 'library', flex: 1 },
            { text: 'Library Preparation Protocol', dataIndex: 'protocol', flex: 1 },
            { text: 'PCR Cycles', dataIndex: 'pcrCycles', width: 100 }
        ]
    }]
});
