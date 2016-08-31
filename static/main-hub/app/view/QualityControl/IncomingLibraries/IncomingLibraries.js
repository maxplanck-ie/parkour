Ext.define('MainHub.view.QualityControl.IncomingLibraries.IncomingLibraries', {
    extend: 'Ext.container.Container',
    xtype: 'incoming-libraries',

    requires: [
        'MainHub.view.QualityControl.IncomingLibraries.IncomingLibrariesController'
    ],

    controller: 'qualitycontrol-incominglibraries-incominglibraries',

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
                        xtype: 'textfield',
                        itemId: 'searchField',
                        emptyText: 'Search',
                        width: 200,
                        margin: '0 15px 0 0',
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
                    { text: 'Nucleic Acid Type', dataIndex: 'nucleicAcidType', flex: 1, tdCls: 'userEntry' },
                    { text: 'Protocol', dataIndex: 'libraryProtocol', flex: 1, tdCls: 'userEntry' },
                    { text: 'Concentration (user) (ng/µl)', dataIndex: 'concentration', flex: 1, tdCls: 'userEntry' },
                    { text: 'Concentration Method', dataIndex: 'concentrationMethod', flex: 1, tdCls: 'userEntry' },
                    { text: 'Sample Volume (µl)', dataIndex: 'sampleVolume', flex: 1, tdCls: 'userEntry' },
                    { text: 'qPCR Result (nM)', dataIndex: 'qPCRResult', flex: 1, tdCls: 'userEntry' },
                    { text: 'Mean Fragment Size (bp)', dataIndex: 'meanFragmentSize', flex: 1, tdCls: 'userEntry' },
                    { text: 'RNA Quality (RIN, RQN)', dataIndex: 'rnaQuality', flex: 1, tdCls: 'userEntry' },

                    { text: 'Dilution Factor', dataIndex: 'dilutionFactor', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                      } 
                    },
                    { text: 'Concentration (ng/µl)', dataIndex: 'concentrationFacility', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      } 
                    },
                    { text: 'Concentration Method', dataIndex: 'concentrationMethodFacility', width: 100, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'combobox',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        store: 'concentrationMethodsStore',
                        forceSelection: true
                      }
                    },
                    { text: 'Date', dataIndex: 'dateFacility', flex: 1, tdCls: 'facilityEntry' },
                    { text: 'Sample volume (µl)', dataIndex: 'sampleVolumeFacility', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0,
                        allowDecimals: false
                      },
                    },
                    { text: 'Amount (ng)', dataIndex: 'amountFacility', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      } 
                    },
                    { text: 'qPCR result (nM)', dataIndex: 'qPCRResultFacility', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      }
                    },
                    { text: 'Size distribution', dataIndex: 'sizeDistributionFacility', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'textfield'
                      } 
                    },
                    { text: 'RNA Quality (RIN, RQN)', dataIndex: 'rnaQualityFacility', flex: 1, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'numberfield',
                        minValue: 0
                      } 
                    },
                    { text: 'Comments', dataIndex: 'commentsFacility', width: 150, tdCls: 'facilityEntry', 
                      editor: {
                        xtype: 'textarea'
                      }
                    },
                    { text: 'QC Result', dataIndex: 'qcResultFacility', width: 100, tdCls: 'facilityEntry', 
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
