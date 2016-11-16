Ext.define('MainHub.view.pooling.LibraryPreparation', {
    extend: 'Ext.container.Container',
    xtype: 'library-preparation',

    requires: [
        'MainHub.view.pooling.LibraryPreparationController'
    ],

    controller: 'library-preparation',

    anchor : '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'libraryPreparationTable',
        itemId: 'libraryPreparationTable',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Library Preparation'
        },
        padding: 15,
        viewConfig: {
            markDirty: false
        },
        plugins: [
            {
                ptype: 'rowediting',
                clicksToEdit: 2
            },
            {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            }
        ],
        features: [{
            ftype:'grouping',
            groupHeaderTpl: '<strong>Protocol: {name}</strong>'
        }],
        store: 'libraryPreparationStore',

        columns: [
            {
                text: 'Sample',
                dataIndex: 'name',
                width: 200
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                width: 90
            },
            {
                text: 'Concentration Sample (ng/µl)',
                dataIndex: 'concentrationSample',
            },
            {
                text: 'Protocol',
                dataIndex: 'libraryProtocolName'
            },
            {
                text: 'Starting Amount (ng)',
                dataIndex: 'startingAmount',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 1
                }
            },
            {
                text: 'Starting Volume (ng)',
                dataIndex: 'startingVolume',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 1
                }
            },
            {
                text: 'Spike-in Description',
                dataIndex: 'spikeInDescription',
                editor: {
                    xtype: 'textarea'
                }
            },
            {
                text: 'Spike-in Volume (µl)',
                dataIndex: 'spikeInVolume',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 1
                }
            },
            {
                text: 'µl Sample',
                dataIndex: 'ulSample',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0.1
                }
            },
            {
                text: 'µl Buffer',
                dataIndex: 'ulBuffer',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0.1
                }
            },
            {
                text: 'Index I7 ID',
                dataIndex: 'indexI7Id'
            },
            {
                text: 'Index I5 ID',
                dataIndex: 'indexI5Id'
            },
            {
                text: 'PCR Cycles',
                dataIndex: 'pcrCycles',
                editor: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    minValue: 1
                }
            },
            {
                text: 'Concentration Library (ng/µl)',
                dataIndex: 'concentrationLibrary',
                editor: {
                    xtype: 'numberfield',
                    minValue: 1
                }
            },
            {
                text: 'Mean Fragment Size (bp)',
                dataIndex: 'meanFragmentSize',
                editor: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    minValue: 1
                }
            },
            {
                text: 'nM',
                dataIndex: 'nM',
                editor: {
                    xtype: 'numberfield',
                    minValue: 1
                }
            },
            {
                text: 'Library QC',
                dataIndex: 'libraryQC'
            }
        ]
    }]
});
