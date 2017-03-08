Ext.define('MainHub.view.libraries.BatchAddWindow', {
    extend: 'Ext.window.Window',
    controller: 'libraries-batchaddwindow',

    requires: ['MainHub.view.libraries.BatchAddWindowController'],

    title: 'Add Samples',
    height: 650,
    width: 1000,
    modal: true,
    resizable: false,
    maximizable: true,
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'batchAddGrid',
        itemId: 'batchAddGrid',
        border: 0,
        columns: [{
                xtype: 'rownumberer',
                width: 40
            },
            {
                text: 'Name',
                dataIndex: 'name',
                minWidth: 200,
                flex: 1,
                editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: 'Protocol',
                dataIndex: 'library_protocol',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'libraryProtocolsStore',
                    forceSelection: true
                }
            },
            {
                text: 'Depth (M)',
                dataIndex: 'sequencing_depth',
                width: 85,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    allowDecimals: false
                }
            },
            {
                text: 'ng/μl',
                dataIndex: 'concentration',
                width: 70,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },
            {
                text: 'Method',
                dataIndex: 'concentration_method',
                width: 80,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'concentrationMethodsStore',
                    forceSelection: true
                }
            },
            {
                text: 'μg',
                dataIndex: 'sample_volume',
                width: 70,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            }
        ],
        store: Ext.create('Ext.data.Store', {
            fields: [{
                    type: 'string',
                    name: 'name'
                },
                {
                    type: 'int',
                    name: 'library_protocol'
                },
                {
                    type: 'int',
                    name: 'sequencing_depth'
                },
                {
                    type: 'float',
                    name: 'concentration'
                },
                {
                    type: 'int',
                    name: 'concentration_method'
                },
                {
                    type: 'int',
                    name: 'sample_volume'
                }
            ],
            data: []
        }),
        tbar: [{
            xtype: 'container',
            padding: 5,
            layout: 'hbox',
            items: [{
                    xtype: 'numberfield',
                    itemId: 'numEmptyRecords',
                    fieldLabel: '# of empty records',
                    padding: '0 10px 0 0',
                    labelWidth: 125,
                    width: 210,
                    minValue: 0
                },
                {
                    xtype: 'button',
                    itemId: 'createEmptyRecordsBtn',
                    text: 'Create'
                }
            ]
        }],
        bbar: [
            '->',
            {
                text: 'Save',
                itemId: 'saveBtn'
            }
        ],
        plugins: [{
            ptype: 'rowediting',
            clicksToEdit: 1
        }]
    }]
});
