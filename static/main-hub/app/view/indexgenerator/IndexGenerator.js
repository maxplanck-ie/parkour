Ext.define('MainHub.view.indexgenerator.IndexGenerator', {
    extend: 'Ext.container.Container',
    xtype: 'index-generator',
    id: 'poolingContainer',

    requires: [
        'MainHub.view.indexgenerator.IndexGeneratorController'
    ],

    controller: 'index-generator',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    padding: 15,

    initComponent: function() {
        var me = this;

        me.items = [{
                xtype: 'treepanel',
                id: 'poolingTreePanel',
                itemId: 'poolingTreePanel',
                height: Ext.Element.getViewportHeight() - 94,
                margin: '0 15px 0 0',
                flex: 1,
                header: {
                    title: 'Libraries and Samples for Pooling',
                    items: [{
                        xtype: 'combobox',
                        id: 'poolSize',
                        itemId: 'poolSize',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'value',
                        forceSelection: true,
                        cls: 'panel-header-combobox',
                        fieldLabel: 'Pool Size',
                        labelWidth: 65,
                        width: 170,

                        store: Ext.create('Ext.data.Store', {
                            fields: [{
                                    name: 'value',
                                    type: 'int'
                                },
                                {
                                    name: 'name',
                                    type: 'string'
                                }
                            ],
                            data: [{
                                    value: 25,
                                    name: '25 M'
                                },
                                {
                                    value: 130,
                                    name: '130 M'
                                },
                                {
                                    value: 200,
                                    name: '200 M'
                                },
                                {
                                    value: 400,
                                    name: '400 M'
                                },
                                {
                                    value: 600,
                                    name: '600 M'
                                },
                                {
                                    value: 800,
                                    name: '800 M'
                                },
                                {
                                    value: 1000,
                                    name: '1000 M'
                                },
                                {
                                    value: 1200,
                                    name: '1200 M'
                                },
                                {
                                    value: 1400,
                                    name: '1400 M'
                                },
                                {
                                    value: 1600,
                                    name: '1600 M'
                                }
                            ]
                        })
                    }]
                },
                viewConfig: {
                    markDirty: false
                },
                plugins: [{
                    ptype: 'rowediting',
                    clicksToEdit: 1
                }],
                store: 'PoolingTree',
                rootVisible: false,
                sortableColumns: false,
                columns: [{
                        xtype: 'treecolumn',
                        text: 'Name',
                        dataIndex: 'text',
                        sortable: true,
                        minWidth: 250,
                        flex: 1
                    },
                    {
                        text: 'Barcode',
                        dataIndex: 'barcode',
                        width: 90
                    },
                    {
                        text: '',
                        dataIndex: 'recordType',
                        width: 35
                    },
                    {
                        text: 'Depth (M)',
                        tooltip: 'Sequencing Depth',
                        dataIndex: 'sequencingDepth',
                        width: 85
                    },
                    {
                        text: 'Length',
                        tooltip: 'Read Length',
                        dataIndex: 'readLength',
                        width: 70,
                        editor: {
                            xtype: 'combobox',
                            queryMode: 'local',
                            valueField: 'id',
                            displayField: 'name',
                            store: 'readLengthsStore',
                            matchFieldWidth: false,
                            forceSelection: true
                        },
                        renderer: function(value, meta, record) {
                            var name = record.get('readLengthName');
                            return name ? name : '';
                        }
                    },
                    {
                        text: 'Protocol',
                        dataIndex: 'libraryProtocolName',
                        width: 150
                    },
                    {
                        text: 'Index Type',
                        dataIndex: 'indexType',
                        width: 150,
                        editor: {
                            id: 'indexTypePoolingEditor',
                            xtype: 'combobox',
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'id',
                            store: 'indexTypesStore',
                            matchFieldWidth: false,
                            forceSelection: true
                        },
                        renderer: function(value, meta, record) {
                            var name = record.get('indexTypeName');
                            return name ? name : '';
                        }
                    },
                    {
                        text: 'Index I7',
                        dataIndex: 'indexI7',
                        width: 100
                    },
                    {
                        text: 'Index I5',
                        dataIndex: 'indexI5',
                        width: 100
                    }
                ]
            },
            {
                xtype: 'grid',
                id: 'poolGrid',
                itemId: 'poolGrid',
                cls: 'pooling-grid',
                header: {
                    title: 'Pool',
                    height: 56
                },
                height: Ext.Element.getViewportHeight() - 94,
                flex: 1,
                features: [{
                    ftype: 'summary'
                }],
                viewConfig: {
                    markDirty: false
                },
                problematicCycles: [],
                sortableColumns: false,
                columns: [{
                        text: 'Name',
                        dataIndex: 'name',
                        width: 200
                    },
                    {
                        text: '',
                        dataIndex: 'recordType',
                        width: 35
                    },
                    {
                        text: 'Depth (M)',
                        dataIndex: 'sequencingDepth',
                        width: 85,
                        summaryType: 'sum',
                        summaryRenderer: function(value) {
                            return (value > 0) ? value : '';
                        }
                    },
                    {
                        text: 'Index I7 ID',
                        dataIndex: 'indexI7Id',
                        width: 90,
                        summaryRenderer: function() {
                            var totalSequencingDepth = Ext.getCmp('poolGrid').getStore().sum('sequencingDepth');
                            return (totalSequencingDepth > 0) ? '<span class="summary-green">green:</span><br><span class="summary-red">red:</span>' : '';
                        }
                    },
                    {
                        text: '1',
                        dataIndex: 'indexI7_1',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '2',
                        dataIndex: 'indexI7_2',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '3',
                        dataIndex: 'indexI7_3',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '4',
                        dataIndex: 'indexI7_4',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '5',
                        dataIndex: 'indexI7_5',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '6',
                        dataIndex: 'indexI7_6',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '7',
                        dataIndex: 'indexI7_7',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        width: 55
                    },
                    {
                        text: '8',
                        dataIndex: 'indexI7_8',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        width: 55
                    },
                    {
                        text: 'Index I5 ID',
                        dataIndex: 'indexI5Id',
                        summaryRenderer: function() {
                            var totalSequencingDepth = Ext.getCmp('poolGrid').getStore().sum('sequencingDepth');
                            return (totalSequencingDepth > 0) ? '<span class="summary-green">green:</span><br><span class="summary-red">red:</span>' : '';
                        },
                        width: 90
                    },
                    {
                        text: '1',
                        dataIndex: 'indexI5_1',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '2',
                        dataIndex: 'indexI5_2',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '3',
                        dataIndex: 'indexI5_3',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '4',
                        dataIndex: 'indexI5_4',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '5',
                        dataIndex: 'indexI5_5',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '6',
                        dataIndex: 'indexI5_6',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversity,
                        summaryRenderer: me.renderSummary,
                        width: 55
                    },
                    {
                        text: '7',
                        dataIndex: 'indexI5_7',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        width: 55
                    },
                    {
                        text: '8',
                        dataIndex: 'indexI5_8',
                        cls: 'nucleotide-header',
                        renderer: me.renderCell,
                        width: 55
                    }
                ],
                store: [],
                bbar: [{
                        xtype: 'button',
                        id: 'generateIndices',
                        itemId: 'generateIndices',
                        text: 'Generate Indices',
                        disabled: true
                    },
                    '->',
                    {
                        xtype: 'button',
                        id: 'savePool',
                        itemId: 'savePool',
                        text: 'Save Pool',
                        disabled: true
                    }
                ]
            }
        ];

        me.callParent(arguments);
    },

    renderCell: function(val, meta) {
        if (val == 'G' || val == 'T') {
            meta.tdStyle = 'background-color:#dcedc8';
        } else if (val == 'A' || val == 'C') {
            meta.tdStyle = 'background-color:#ef9a9a';
        }
        meta.tdCls = 'nucleotide';
        return val;
    },

    calculateColorDiversity: function(records, values) {
        var diversity = {
            green: 0,
            red: 0
        };

        for (var i = 0; i < values.length; i++) {
            var nuc = values[i];
            if (nuc != ' ' && typeof nuc != 'undefined') {
                if (nuc == 'G' || nuc == 'T') {
                    diversity.green += records[i].get('sequencingDepth');
                } else if (nuc == 'A' || nuc == 'C') {
                    diversity.red += records[i].get('sequencingDepth');
                }
            }
        }

        return diversity;
    },

    renderSummary: function(value, summaryData, dataIndex) {
        var result = '',
            grid = Ext.getCmp('poolGrid'),
            totalSequencingDepth = 0;

        if (value.green > 0 || value.red > 0) {
            if (dataIndex.split('_')[0] == 'indexI7') {
                // Consider only non empty Index I7 indices
                grid.getStore().each(function(record) {
                    if (record.get('indexI7') !== '') {
                        totalSequencingDepth += record.get('sequencingDepth');
                    }
                });
            } else {
                // Consider only non empty Index I5 indices
                grid.getStore().each(function(record) {
                    if (record.get('indexI5') !== '') {
                        totalSequencingDepth += record.get('sequencingDepth');
                    }
                });
            }

            var green = parseInt(((value.green / totalSequencingDepth) * 100).toFixed(0)),
                red = parseInt(((value.red / totalSequencingDepth) * 100).toFixed(0));

            result = green + '%' + '<br>' + red + '%';

            if ((green < 20 && red > 80) || (red < 20 && green > 80)) {
                result += '<br>!';

                // Remember the cell in order to highlight it after summary refresh
                if (grid.problematicCycles.indexOf(this.id) == -1) {
                    grid.problematicCycles.push(this.id);
                }
            }
        }

        return result;
    }
});
