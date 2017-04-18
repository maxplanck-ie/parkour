Ext.define('MainHub.view.incominglibraries.IncomingLibraries', {
    extend: 'Ext.container.Container',
    xtype: 'incoming-libraries',

    requires: [
        'MainHub.view.incominglibraries.IncomingLibrariesController'
    ],

    controller: 'incominglibraries-incominglibraries',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'incomingLibraries',
        itemId: 'incomingLibraries',
        height: Ext.Element.getViewportHeight() - 64,
        region: 'center',
        padding: 15,
        header: {
            title: 'Incoming Libraries and Samples',
            items: [{
                    xtype: 'fieldcontainer',
                    defaultType: 'checkboxfield',
                    layout: 'hbox',
                    margin: '0 20 0 0',
                    items: [{
                            boxLabel: 'Show Libraries',
                            itemId: 'showLibrariesCheckbox',
                            margin: '0 15 0 0',
                            cls: 'grid-header-checkbox',
                            checked: true
                        },
                        {
                            boxLabel: 'Show Samples',
                            itemId: 'showSamplesCheckbox',
                            cls: 'grid-header-checkbox',
                            checked: true
                        }
                    ]
                },
                {
                    xtype: 'textfield',
                    itemId: 'searchField',
                    emptyText: 'Search',
                    width: 200
                }
            ]
        },
        viewConfig: {
            loadMask: false,
            markDirty: false
        },
        store: 'incomingLibrariesStore',
        columns: {
            items: [{
                    text: 'Name',
                    dataIndex: 'name',
                    minWidth: 150,
                    flex: 1,
                    tdCls: 'userEntry',
                    renderer: function(val, meta) {
                        meta.tdStyle = 'font-weight:bold';
                        return val;
                    }
                },
                {
                    text: '',
                    dataIndex: 'recordType',
                    tdCls: 'userEntry',
                    width: 30
                },
                {
                    text: 'Barcode',
                    dataIndex: 'barcode',
                    tdCls: 'userEntry',
                    width: 90
                },
                {
                    text: 'Nuc. Type',
                    tooltip: 'Nucleic Acid Type',
                    dataIndex: 'nucleicAcidType',
                    tdCls: 'userEntry',
                    minWidth: 100,
                    flex: 1
                },
                {
                    text: 'Protocol',
                    tooltip: 'Library Protocol',
                    dataIndex: 'library_protocol_name',
                    tdCls: 'userEntry',
                    minWidth: 100,
                    flex: 1
                },
                {
                    text: 'ng/µl',
                    tooltip: 'Concentration (user)',
                    dataIndex: 'concentration',
                    tdCls: 'userEntry',
                    width: 70
                },
                {
                    text: 'F/S*',
                    tooltip: 'Concentration Method (user)',
                    dataIndex: 'concentration_method_name',
                    tdCls: 'userEntry',
                    width: 50,
                    renderer: function(val) {
                        return val.charAt(0);
                    }
                },
                {
                    text: 'qPCR (nM)',
                    tooltip: 'qPCR Result (user)',
                    dataIndex: 'qPCRResult',
                    tdCls: 'userEntry',
                    width: 85
                },
                {
                    text: 'bp',
                    tooltip: 'Mean Fragment Size (user)',
                    dataIndex: 'meanFragmentSize',
                    tdCls: 'userEntry',
                    width: 45
                },
                {
                    text: 'RQN',
                    tooltip: 'RNA Quality (user)',
                    dataIndex: 'rnaQuality',
                    tdCls: 'userEntry',
                    width: 55,
                    renderer: function(val) {
                        var record = Ext.getStore('rnaQualityStore').findRecord('id', val);
                        return (record) ? record.get('name') : '';
                    }
                },

                // Facility
                {
                    text: 'DF',
                    tooltip: 'Dilution Factor (facility)',
                    dataIndex: 'dilution_factor',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                    }
                },
                {
                    text: 'ng/µl',
                    tooltip: 'Concentration (facility)',
                    dataIndex: 'concentration_facility',
                    tdCls: 'facilityEntry',
                    width: 90,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'µl',
                    tooltip: 'Sample Volume (facility)',
                    dataIndex: 'sample_volume_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                    }
                },
                {
                    text: 'ng',
                    tooltip: 'Amount (facility)',
                    dataIndex: 'amount_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'F/S*',
                    tooltip: 'Concentration Method (facility)',
                    dataIndex: 'concentration_method_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        store: 'concentrationMethodsStore',
                        matchFieldWidth: false,
                        forceSelection: true
                    },
                    renderer: function(val) {
                        var store = Ext.getStore('concentrationMethodsStore'),
                            record = store.findRecord('id', val);
                        return (record) ? record.get('name').charAt(0) : '';
                    }
                },
                // {
                //     text: 'Date',
                //     dataIndex: 'dateFacility',
                //     tdCls: 'facilityEntry'
                // },
                {
                    text: 'qPCR (nM)',
                    tooltip: 'qPCR Result (facility)',
                    dataIndex: 'qpcr_result_facility',
                    tdCls: 'facilityEntry',
                    width: 85,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        disabled: true
                    }
                },
                {
                    text: 'bp',
                    tooltip: 'Size Distribution (facility)',
                    dataIndex: 'size_distribution_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 0
                    }
                },
                {
                    text: 'RQN',
                    tooltip: 'RNA Quality (facility)',
                    dataIndex: 'rna_quality_facility',
                    tdCls: 'facilityEntry',
                    width: 80,
                    editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        valueField: 'id',
                        displayField: 'name',
                        store: 'rnaQualityStore',
                        // matchFieldWidth: false,
                        forceSelection: true
                    },
                    renderer: function(val) {
                        var record = Ext.getStore('rnaQualityStore').findRecord('id', val);
                        return (record) ? record.get('name') : '';
                    }
                },
                {
                    text: 'Comments',
                    tooltip: 'Comments (facility)',
                    dataIndex: 'comments_facility',
                    tdCls: 'facilityEntry',
                    width: 150,
                    editor: {
                        xtype: 'textfield'
                    }
                },
                {
                    text: 'QC Result',
                    dataIndex: 'qc_result',
                    tdCls: 'facilityEntry',
                    width: 90,
                    editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        store: Ext.create('Ext.data.Store', {
                            fields: [{
                                    name: 'id',
                                    type: 'int'
                                },
                                {
                                    name: 'name',
                                    type: 'string'
                                }
                            ],
                            data: [{
                                    id: 1,
                                    name: 'passed'
                                },
                                {
                                    id: 2,
                                    name: 'failed'
                                }
                            ]
                        }),
                        forceSelection: true
                    }
                }
            ]
        },
        features: [{
            ftype: 'grouping',
            groupHeaderTpl: '<strong>Request: {name}</strong> (No. of Libraries/Samples: {rows.length})'
        }],
        plugins: [{
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            },
            {
                ptype: 'rowediting',
                clicksToEdit: 1
            }
        ]
    }]
});
