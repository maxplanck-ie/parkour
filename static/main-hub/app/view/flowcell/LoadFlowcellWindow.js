Ext.define('MainHub.view.flowcell.LoadFlowcellWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'MainHub.view.flowcell.LoadFlowcellWindowController'
    ],

    controller: 'load-flowcell-window',

    title: 'Load Flowcell',
    height: 450,
    width: 750,

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
                                labelWidth: 120,
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
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'sequencingRunCondition',
                                    fieldLabel: 'Read Length',
                                    emptyText: 'Read Length',
                                    store: 'sequencingRunConditionsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: 'Flowcell ID'
                                }
                            ]
                        },
                        {
                            xtype: 'grid',
                            itemId: 'poolsFlowcell',
                            padding: '0 6px 0 0',
                            width: 400,
                            height: 275,
                            border: 0,
                            style: {
                                borderLeft: '1px solid #d0d0d0'
                            },

                            columns: [
                                {
                                    text: 'Pool',
                                    dataIndex: 'name',
                                    flex: 1
                                },
                                {
                                    text: 'Size',
                                    dataIndex: 'size',
                                    width: 80
                                },
                                {
                                    text: 'Lane',
                                    dataIndex: 'lane',
                                    width: 80
                                }
                            ],

                            store: 'poolsStore'
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
