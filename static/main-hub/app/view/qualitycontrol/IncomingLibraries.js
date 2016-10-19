Ext.define('MainHub.view.qualitycontrol.IncomingLibraries', {
    extend: 'Ext.container.Container',
    xtype: 'incoming-libraries',

    requires: [
        'MainHub.view.qualitycontrol.IncomingLibrariesController'
    ],

    controller: 'qualitycontrol-incominglibraries',

    anchor : '100% -1',
    layout: 'fit',

    items: [
        {
            xtype: 'grid',
            id: 'incomingLibraries',
            itemId: 'incomingLibraries',
            height: Ext.Element.getViewportHeight() - 64,
            region: 'center',
            padding: 15,

            header: {
                title: 'Incoming Libraries and Samples',
                items: [
                    {
                        xtype: 'fieldcontainer',
                        defaultType: 'checkboxfield',
                        layout: 'hbox',
                        margin: '0 20 0 0',
                        items: [
                            {
                                boxLabel: 'Show Libraries',
                                itemId: 'showLibrariesCheckbox',
                                id: 'showLibrariesCheckbox',
                                margin: '0 15 0 0',
                                cls: 'grid-header-checkbox',
                                checked: true
                            },
                            {
                                boxLabel: 'Show Samples',
                                itemId: 'showSamplesCheckbox',
                                id: 'showSamplesCheckbox',
                                cls: 'grid-header-checkbox',
                                checked: true
                            }
                        ]
                    },
                    {
                        xtype: 'textfield',
                        itemId: 'searchField',
                        emptyText: 'Search',
                        width: 200,
                        disabled: true
                    }
                ]
            },

            store: 'incomingLibrariesStore',

            columns: {
                items: [
                    { text: 'Name', dataIndex: 'name', width: 150, tdCls: 'userEntry',
                      renderer: function(val, meta) {
                        meta.tdStyle = 'font-weight:bold';
                        return val;
                      }
                    },
                    { text: '', dataIndex: 'recordType', width: 30, tdCls: 'userEntry' },
                    { text: 'Barcode', dataIndex: 'barcode', width: 90, tdCls: 'userEntry' },
                    { text: 'Nucleic Acid Type', dataIndex: 'nucleicAcidType', tdCls: 'userEntry' },
                    { text: 'Protocol', dataIndex: 'libraryProtocol', tdCls: 'userEntry' },
                    { text: 'Concentration (user) (ng/µl)', dataIndex: 'concentration', tdCls: 'userEntry' },
                    { text: 'Concentration Method', dataIndex: 'concentrationMethod', tdCls: 'userEntry' },
                    { text: 'Sample Volume (µl)', dataIndex: 'sampleVolume', tdCls: 'userEntry' },
                    { text: 'qPCR Result (nM)', dataIndex: 'qPCRResult', tdCls: 'userEntry' },
                    { text: 'Mean Fragment Size (bp)', dataIndex: 'meanFragmentSize', tdCls: 'userEntry' },
                    { text: 'RNA Quality (RIN, RQN)', dataIndex: 'rnaQuality', tdCls: 'userEntry' },

                    { text: 'Dilution Factor', dataIndex: 'dilutionFactor', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                      }
                    },
                    { text: 'Concentration (ng/µl)', dataIndex: 'concentrationFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      }
                    },
                    { text: 'Concentration Method', dataIndex: 'concentrationMethodFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        store: 'concentrationMethodsStore',
                        forceSelection: true
                      }
                    },
                    { text: 'Date', dataIndex: 'dateFacility', tdCls: 'facilityEntry' },
                    { text: 'Sample volume (µl)', dataIndex: 'sampleVolumeFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                      }
                    },
                    { text: 'Amount (ng)', dataIndex: 'amountFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      }
                    },
                    { text: 'qPCR result (nM)', dataIndex: 'qPCRResultFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      }
                    },
                    { text: 'Size distribution', dataIndex: 'sizeDistributionFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'textfield'
                      }
                    },
                    { text: 'RNA Quality (RIN, RQN)', dataIndex: 'rnaQualityFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      }
                    },
                    { text: 'Comments', dataIndex: 'commentsFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'textarea'
                      }
                    },
                    { text: 'QC Result', dataIndex: 'qcResultFacility', tdCls: 'facilityEntry',
                      editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        store: Ext.create('Ext.data.Store', {
                            fields: [
                                { name: 'id', type: 'int' },
                                { name: 'name', type: 'string' }
                            ],
                            data: [
                                { id: 1, name: 'QC passed' },
                                { id: 2, name: 'QC failed' }
                            ]
                        }),
                        forceSelection: true
                      }
                    }
                ]
            },

            features: [{
                ftype:'grouping',
                groupHeaderTpl: '<strong>Request: {name}</strong> (No. of Libraries/Samples: {rows.length})'
            }],

            plugins: [
                {
                    ptype: 'bufferedrenderer',
                    trailingBufferZone: 100,
                    leadingBufferZone: 100
                },
                {
                    ptype: 'rowediting',
                    clicksToEdit: 2
                }
            ]
        }
    ]
});
