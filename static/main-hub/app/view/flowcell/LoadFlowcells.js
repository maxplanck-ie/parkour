Ext.define('MainHub.view.flowcell.LoadFlowcells', {
    extend: 'Ext.container.Container',
    xtype: 'load-flowcells',

    requires: [
        'MainHub.view.flowcell.LoadFlowcellsController'
    ],

    controller: 'load-flowcells',

    anchor : '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        itemId: 'flowcellsTable',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Load Flowcells',
            items: [{
                xtype: 'button',
                itemId: 'loadBtn',
                text: 'Load'
            }]
        },
        padding: 15,
        plugins: [{
            ptype: 'bufferedrenderer',
            trailingBufferZone: 100,
            leadingBufferZone: 100
        }],
        // store: 'libraryPreparationStore',

        columns: [
            {
                text: 'Pool',
                dataIndex: 'poolName',
                flex: 1
            },
            {
                text: 'Pool Size',
                dataIndex: 'poolSize',
                flex: 1
            },
            {
                text: 'Read Length',
                dataIndex: 'readLength',
                flex: 1
            },
            {
                text: 'Index I7',
                dataIndex: 'indexI7',
                flex: 1
            },
            {
                text: 'Index I5',
                dataIndex: 'indexI5',
                flex: 1
            },
            {
                text: 'Sequencer',
                dataIndex: 'sequencer',
                flex: 1
            },
            {
                text: 'Loading Concentration',
                dataIndex: 'loadingConcentration',
                flex: 1
            },
            {
                text: 'Flowcell ID',
                dataIndex: 'flowcellId',
                flex: 1
            }
        ]
    }]
});
