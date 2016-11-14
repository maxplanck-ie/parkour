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
            { text: 'Sample',                           dataIndex: 'name', width: 200       },
            { text: 'Barcode',                          dataIndex: 'barcode', width: 90     },
            { text: 'Concentration Sample',             dataIndex: 'concentrationSample'    },
            { text: 'Protocol',                         dataIndex: 'libraryProtocolName'    },
            { text: 'Starting Amount',                  dataIndex: 'startingAmount'         },
            { text: 'Spike-in Description',             dataIndex: 'spikeInDescription'     },
            { text: 'Spike-in Volume',                  dataIndex: 'spikeInVolume'          },
            { text: 'µl Sample',                        dataIndex: 'ulSample'               },
            { text: 'µl Buffer',                        dataIndex: 'ulBuffer'               },
            { text: 'Index I7 ID',                      dataIndex: 'indexI7Id'              },
            { text: 'Index I5 ID',                      dataIndex: 'indexI5Id'              },
            { text: 'PCR Cycles',                       dataIndex: 'pcrCycles'              },
            { text: 'Concentration Library (ng/µl)',    dataIndex: 'concentrationLibrary'   },
            { text: 'Mean Fragment Size',               dataIndex: 'meanFragmentSize'       },
            { text: 'nM',                               dataIndex: 'nM'                     },
            { text: 'Library QC',                       dataIndex: 'libraryQC'              }
        ]
    }]
});
