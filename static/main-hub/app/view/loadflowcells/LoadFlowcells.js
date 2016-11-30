Ext.define('MainHub.view.loadflowcells.LoadFlowcells', {
    extend: 'Ext.container.Container',
    xtype: 'load-flowcells',

    requires: [
        'MainHub.view.loadflowcells.LoadFlowcellsController',
    ],

    controller: 'load-flowcells',

    anchor : '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Load Flowcells',
            items: [{
                xtype: 'button',
                itemId: 'addBtn',
                text: 'Add'
            }]
        },
        padding: 15
    }]
});
