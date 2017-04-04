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
        store: Ext.create('Ext.data.Store', {
            fields: [{
                    type: 'string',
                    name: 'name'
                },
                {
                    type: 'int',
                    name: 'nucleic_acid_type'
                },
                {
                    type: 'int',
                    name: 'library_protocol'
                },
                {
                    type: 'int',
                    name: 'library_type'
                },
                {
                    type: 'string',
                    name: 'sequencing_depth'
                },
                {
                    type: 'string',
                    name: 'concentration'
                },
                {
                    type: 'int',
                    name: 'concentration_method'
                },
                {
                    type: 'int',
                    name: 'rna_quality'
                },
                {
                    type: 'string',
                    name: 'sample_volume'
                },
                {
                    type: 'string',
                    name: 'amplification_cycles'
                },
                {
                    type: 'int',
                    name: 'read_length'
                },
                {
                    type: 'int',
                    name: 'organism'
                }
            ],
            // validations: [{
            //     type: 'presence',
            //     field: 'name'
            // }],
            data: []
        }),
        columns: [{
                xtype: 'rownumberer',
                width: 40
            },
            {
                text: 'Name',
                dataIndex: 'name',
                tooltip: 'Sample Name',
                minWidth: 200,
                flex: 1,
                editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: 'Nuc. Type',
                dataIndex: 'nucleic_acid_type',
                tooltip: 'Nucleic Acid Type',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    id: 'nucleicAcidTypeEditor',
                    itemId: 'nucleicAcidTypeEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'nucleicAcidTypesStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('nucleicAcidTypesStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Protocol',
                dataIndex: 'library_protocol',
                tooltip: 'Library Protocol',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    id: 'libraryProtocolEditor',
                    itemId: 'libraryProtocolEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'libraryProtocolsStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('libraryProtocolsStore');
                    store.clearFilter();
                    var record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Library Type',
                dataIndex: 'library_type',
                tooltip: 'Library Type',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    id: 'libraryTypeEditor',
                    itemId: 'libraryTypeEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'libraryTypesStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('libraryTypesStore');
                    store.clearFilter();
                    var record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'ng/μl',
                dataIndex: 'concentration',
                tooltip: 'Concentration',
                width: 70,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },
            {
                text: 'RQN',
                dataIndex: 'rna_quality',
                tooltip: 'RNA Quality',
                width: 70,
                editor: {
                    xtype: 'combobox',
                    id: 'rnaQualityEditor',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'rnaQualityStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('rnaQualityStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Length',
                dataIndex: 'read_length',
                tooltip: 'Read Length',
                width: 70,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'readLengthsStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('readLengthsStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Depth (M)',
                dataIndex: 'sequencing_depth',
                tooltip: 'Sequencing Depth',
                width: 85,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    allowDecimals: false
                }
            },
            {
                text: 'Amplification',
                tooltip: 'Amplification cycles',
                dataIndex: 'amplification_cycles',
                width: 105,
                editor: {
                    xtype: 'numberfield',
                    minValue: 1,
                    allowDecimals: false,
                    allowBlank: true
                }
            },
            {
                text: 'μl',
                dataIndex: 'sample_volume',
                tooltip: 'Sample Volume',
                width: 70,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },
            {
                text: 'Method',
                dataIndex: 'concentration_method',
                tooltip: 'Concentration Method',
                width: 80,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'concentrationMethodsStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('concentrationMethodsStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Organism',
                dataIndex: 'organism',
                tooltip: 'Organism',
                width: 100,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'organismsStore',
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('organismsStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            }
        ],
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
