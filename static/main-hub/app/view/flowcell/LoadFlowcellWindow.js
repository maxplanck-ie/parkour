Ext.define('MainHub.view.flowcell.LoadFlowcellWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'MainHub.view.flowcell.LoadFlowcellWindowController'
    ],

    controller: 'load-flowcell-window',

    title: 'Load Flowcell',
    height: 550,
    width: 800,

    modal: true,
    resizable: false,
    layout: 'fit',

    items: [{
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            layout: 'hbox',
            height: 375,
            border: 0,
            items: [{
                xtype: 'form',
                padding: 15,
                width: 396,
                border: 0,

                defaultType: 'combobox',
                defaults: {
                    submitEmptyText: false,
                    allowBlank: false,
                    labelWidth: 180,
                    width: 365
                },

                items: [{
                    id: 'sequencerField',
                    itemId: 'sequencerField',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    name: 'sequencer',
                    fieldLabel: 'Sequencer',
                    emptyText: 'Sequencer',
                    store: 'sequencersStore',
                    forceSelection: true
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Flowcell ID'
                }, {
                    id: 'loadingConcentrationField',
                    itemId: 'loadingConcentrationField',
                    xtype: 'numberfield',
                    fieldLabel: 'Loading Concentration (pM)',
                    minValue: 0.1,
                    disabled: true,
                    activeLane: ''
                }, {
                    xtype: 'container',
                    html: 'Result: <div id="flowcell-result">Loaded: <span id="flowcell-result-total">0</span> (M)</div>',
                    padding: '10 0',
                    style: {
                        borderTop: '1px solid #d0d0d0'
                    }
                }, {
                    xtype: 'grid',
                    id: 'flowcellResultGrid',
                    itemId: 'flowcellResultGrid',
                    height: 180,
                    viewConfig: {
                        markDirty: false
                    },
                    store: 'lanesStore',
                    columns: [{
                        text: 'Pool',
                        dataIndex: 'poolName',
                        flex: 1
                    }, {
                        text: 'Lane',
                        dataIndex: 'laneName',
                        width: 70
                    }, {
                        text: 'Concentration',
                        dataIndex: 'loadingConcentration',
                        width: 110
                    }]
                }]
            }, {
                xtype: 'grid',
                id: 'poolsFlowcell',
                itemId: 'poolsFlowcell',
                padding: '0 3 0 0',
                width: 400,
                height: 375,
                border: 0,
                viewConfig: {
                    stripeRows: false,
                    markDirty: false
                },
                style: {
                    borderLeft: '1px solid #d0d0d0'
                },
                store: 'poolsStore',
                columns: [{
                    text: 'Pool',
                    dataIndex: 'name',
                    flex: 1
                }, {
                    text: 'Read Length',
                    dataIndex: 'readLengthName',
                    width: 100
                }, {
                    text: 'Size',
                    dataIndex: 'size',
                    width: 60
                }]
            }]
        }, {
            id: 'lanes',
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'center'
            },
            border: 0,
            style: {
                borderTop: '1px solid #d0d0d0'
            },
            height: 80,
            defaults: {
                margin: 8,
                height: 60
            },
            items: []
        }]
    }],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->', {
                xtype: 'button',
                itemId: 'saveBtn',
                text: 'Save'
            }
        ]
    }]
});
