Ext.define('MainHub.view.flowcell.LoadFlowcellWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'MainHub.view.flowcell.LoadFlowcellWindowController'
    ],

    controller: 'load-flowcell-window',

    title: 'Load Flowcell',
    height: 450,
    width: 850,

    modal: true,
    resizable: false,
    layout: 'fit',

    items: [
        {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    layout: 'hbox',
                    height: 275,
                    border: 0,
                    items: [
                        {
                            xtype: 'form',
                            padding: 10,
                            width: 350,
                            border: 0,

                            defaultType: 'combobox',
                            defaults: {
                                submitEmptyText: false,
                                allowBlank: false,
                                labelWidth: 180,
                                width: 325
                            },

                            items: [
                                {
                                    itemId: 'sequencer',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'sequencer',
                                    fieldLabel: 'Sequencer',
                                    emptyText: 'Sequencer',
                                    store: 'sequencersStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: 'Flowcell ID'
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: 'Loading Concentration (pM)',
                                    disabled: true
                                }
                            ]
                        },
                        {
                            xtype: 'grid',
                            itemId: 'poolsFlowcell',
                            padding: '0 6px 0 0',
                            width: 500,
                            height: 275,
                            border: 0,
                            viewConfig: {
                                markDirty: false
                            },
                            style: {
                                borderLeft: '1px solid #d0d0d0'
                            },
                            store: 'poolsStore',
                            columns: [
                                {
                                    text: 'Pool',
                                    dataIndex: 'name',
                                    flex: 1
                                },
                                {
                                    text: 'Read Length',
                                    dataIndex: 'sequencingRunConditionName',
                                    width: 100
                                },
                                {
                                    text: 'Size',
                                    dataIndex: 'size',
                                    width: 60
                                },
                                {
                                    text: 'Lane',
                                    dataIndex: 'laneName',
                                    width: 70
                                }
                            ]
                        }
                    ]
                },
                {
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
                }
            ]
        }
    ],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->',
            {
                xtype: 'button',
                itemId: 'saveBtn',
                text: 'Save'
            }
        ]
    }]
});
