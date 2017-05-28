Ext.define('MainHub.view.flowcell.LoadFlowcells', {
    extend: 'Ext.container.Container',
    xtype: 'load-flowcells',
    requires: ['MainHub.view.flowcell.LoadFlowcellsController'],
    controller: 'load-flowcells',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        itemId: 'flowcellsTable',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Load Flowcells',
            items: [{
                xtype: 'button',
                itemId: 'loadBtn',
                text: 'Load'
            }]
        },
        padding: 15,
        viewConfig: {
            // loadMask: false,
            stripeRows: false
        },
        store: 'flowcellsStore',
        sortableColumns: false,
        columns: [{
                xtype: 'checkcolumn',
                itemId: 'checkColumn',
                dataIndex: 'selected',
                tdCls: 'no-dirty',
                width: 40
            },
            // {
            //     text: 'Flowcell ID',
            //     dataIndex: 'flowcellId',
            //     flex: 1
            // },
            {
                text: 'Lane',
                dataIndex: 'laneName',
                flex: 1
            }, {
                text: 'Pool',
                dataIndex: 'poolName',
                flex: 1
            }, {
                text: 'Length',
                tooltip: 'Read Length',
                dataIndex: 'readLengthName',
                flex: 1
            }, {
                text: 'Index I7',
                dataIndex: 'indexI7Show',
                flex: 1
            }, {
                text: 'Index I5',
                dataIndex: 'indexI5Show',
                flex: 1
            }, {
                text: 'Sequencer',
                dataIndex: 'sequencerName',
                flex: 1
            }, {
                text: 'Equal nucl.',
                tooltip: 'Equal Representation of Nucleotides',
                dataIndex: 'equalRepresentation',
                flex: 1
            }, {
                text: 'Loading Conc.',
                tooltip: 'Loading Concentration',
                dataIndex: 'loading_concentration',
                flex: 1,
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
                }
            }, {
                text: 'PhiX %',
                dataIndex: 'phix',
                flex: 1,
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
                }
            }
            // {
            //     text: 'QC Result',
            //     dataIndex: 'qc_result',
            //     editor: {
            //         xtype: 'combobox',
            //         queryMode: 'local',
            //         displayField: 'name',
            //         valueField: 'id',
            //         store: Ext.create('Ext.data.Store', {
            //             fields: [{
            //                     name: 'id',
            //                     type: 'int'
            //                 },
            //                 {
            //                     name: 'name',
            //                     type: 'string'
            //                 }
            //             ],
            //             data: [{
            //                     id: 1,
            //                     name: 'passed'
            //                 },
            //                 {
            //                     id: 2,
            //                     name: 'resequencing'
            //                 }
            //             ]
            //         }),
            //         forceSelection: true
            //     }
            // }
        ],
        features: [{
            ftype: 'grouping',
            startCollapsed: true,
            groupHeaderTpl: '<strong>Flowcell ID: {name}</strong>'
        }],
        plugins: [{
            ptype: 'bufferedrenderer',
            trailingBufferZone: 100,
            leadingBufferZone: 100
        }, {
            ptype: 'rowediting',
            clicksToEdit: 1
        }],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
                '->',
                {
                    xtype: 'button',
                    itemId: 'downloadBenchtopProtocolFCBtn',
                    text: 'Download Benchtop Protocol',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                },
                {
                    xtype: 'button',
                    itemId: 'downloadSampleSheetBtn',
                    text: 'Download Sample Sheet',
                    iconCls: 'fa fa-file-text-o fa-lg'
                }
            ]
        }]
    }]
});
