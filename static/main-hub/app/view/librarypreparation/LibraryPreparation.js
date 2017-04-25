Ext.define('MainHub.view.librarypreparation.LibraryPreparation', {
    extend: 'Ext.container.Container',
    xtype: 'library-preparation',

    requires: [
        'MainHub.view.librarypreparation.LibraryPreparationController',
        'MainHub.view.librarypreparation.BenchtopProtocolWindow',
        'Ext.ux.FiddleCheckColumn'
    ],

    controller: 'library-preparation',

    anchor: '100% -1',
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
            loadMask: false
            // markDirty: false
        },
        store: 'libraryPreparationStore',
        sortableColumns: false,
        columns: [{
                xtype: 'fiddlecheckcolumn',
                text: 'Selected',
                dataIndex: 'selected',
                width: 40
            },
            {
                text: 'Sample',
                dataIndex: 'name',
                minWidth: 200,
                flex: 1
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                width: 90
            },
            {
                text: 'Concentration Sample (ng/µl)',
                dataIndex: 'concentration_sample'
            },
            {
                text: 'Protocol',
                dataIndex: 'libraryProtocolName'
            },
            {
                text: 'Starting Amount (ng)',
                dataIndex: 'starting_amount',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
                }
            },
            {
                text: 'Starting Volume (µl)',
                dataIndex: 'starting_volume',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
                }
            },
            {
                text: 'Spike-in Description',
                dataIndex: 'spike_in_description',
                editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: 'Spike-in Volume (µl)',
                dataIndex: 'spike_in_volume',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 1
                }
            },
            {
                text: 'µl Sample',
                tooltip: 'Starting Amount (ng) / Concentration (ng/µl)',
                dataIndex: 'ul_sample',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
                }
            },
            {
                text: 'µl Buffer',
                tooltip: 'Starting Volume (µl) - Sample Volume (µl) - Spike-In (µl)',
                dataIndex: 'ul_buffer',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
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
                dataIndex: 'pcr_cycles',
                editor: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    minValue: 0
                }
            },
            {
                text: 'Concentration Library (ng/µl)',
                dataIndex: 'concentration_library',
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },
            {
                text: 'Mean Fragment Size (bp)',
                dataIndex: 'mean_fragment_size',
                editor: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    minValue: 0.1
                }
            },
            {
                text: 'nM',
                tooltip: '(Concentration (ng/µl) / (650 * Size (bp))) * 10^6',
                dataIndex: 'nM',
                editor: {
                    xtype: 'numberfield',
                    minValue: 1
                }
            },
            {
                text: 'File',
                dataIndex: 'file',
                width: 45,
                renderer: function(value) {
                    return (value !== '') ? '<a class="library-preparation-download" href="' +
                        value + '">' + '<i class="fa fa-download" aria-hidden="true"></i></a>' : '';
                }
            },
            {
                text: 'QC Result',
                dataIndex: 'qc_result',
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
        ],
        plugins: [{
                ptype: 'rowediting',
                clicksToEdit: 1
            },
            {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            }
        ],
        features: [{
            ftype: 'grouping',
            groupHeaderTpl: '<strong>Protocol: {name}</strong>'
        }],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
                '->',
                {
                    xtype: 'button',
                    id: 'downloadBenchtopProtocolLPBtn',
                    itemId: 'downloadBenchtopProtocolLPBtn',
                    text: 'Download Benchtop Protocol as XLS',
                    disabled: true
                }
            ]
        }]
    }]
});
