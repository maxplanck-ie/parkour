Ext.define('MainHub.view.libraries.BatchAddWindow', {
    extend: 'Ext.window.Window',
    requires: [
        'MainHub.model.libraries.BatchAdd.Library',
        'MainHub.model.libraries.BatchAdd.Sample',
        'MainHub.view.libraries.BatchAddWindowController'
    ],
    controller: 'libraries-batchaddwindow',

    title: 'Add Libraries/Samples',
    height: 225,
    width: 400,

    modal: true,
    resizable: false,
    maximizable: true,
    layout: 'fit',

    items: [{
        xtype: 'panel',
        border: 0,
        layout: 'card',
        items: [{
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'center',
                    pack: 'center'
                },
                defaults: {
                    border: 0
                },
                items: [{
                        xtype: 'container',
                        layout: 'hbox',
                        defaultType: 'button',
                        defaults: {
                            margin: 10,
                            width: 100,
                            height: 40
                        },
                        items: [{
                                itemId: 'libraryCardBtn',
                                text: 'Library'
                            },
                            {
                                itemId: 'sampleCardBtn',
                                text: 'Sample'
                            }
                        ]
                    },
                    {
                        html: '<p style="text-align:center">' +
                            'Choose <strong>Library</strong> if samples for sequencing are completely prepared by the user.<br><br>' +
                            'Choose <strong>Sample</strong> if libraries are prepared by the facility.' +
                            '</p>',
                        width: 350
                    }
                ]
            },
            {
                xtype: 'grid',
                id: 'batchAddGrid',
                itemId: 'batchAddGrid',
                sortableColumns: false,
                border: 0,
                viewConfig: {
                    markDirty: false,
                    getRowClass: function(record) {
                        return (record.get('invalid')) ? 'invalid' : '';
                    }
                },
                tbar: [{
                    xtype: 'container',
                    padding: 5,
                    layout: 'hbox',
                    items: [{
                            xtype: 'numberfield',
                            itemId: 'numEmptyRecords',
                            fieldLabel: 'Create empty records',
                            padding: '0 10px 0 0',
                            labelWidth: 145,
                            width: 230,
                            minValue: 0
                        },
                        {
                            xtype: 'button',
                            itemId: 'createEmptyRecordsBtn',
                            text: 'Create'
                        }
                    ]
                }],
                plugins: [{
                    ptype: 'rowediting',
                    clicksToEdit: 1
                }]
            }
        ]
    }],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->',
            {
                xtype: 'button',
                itemId: 'saveBtn',
                iconCls: 'fa fa-floppy-o fa-lg',
                text: 'Save'
            }
        ],
        hidden: true
    }]
});
