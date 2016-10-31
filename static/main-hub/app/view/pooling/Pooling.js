Ext.define('MainHub.view.pooling.Pooling', {
    extend: 'Ext.container.Container',
    xtype: 'pooling',
    id: 'poolingContainer',

    requires: [
        'MainHub.view.pooling.PoolingController',
    ],

    controller: 'pooling',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    padding: 15,

    initComponent: function() {
        var me = this;

        me.items = [
            {
                xtype: 'treepanel',
                itemId: 'poolingTreePanel',
                height: Ext.Element.getViewportHeight() - 94,
                margin: '0 15px 0 0',
                flex: 1,
                header: {
                    title: 'Libraries for Pooling',
                    items: [
                        {
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
                                fields: [
                                    { name: 'value', type: 'int'    },
                                    { name: 'name',  type: 'string' }
                                ],
                                data: [
                                    { value: 25,   name: '25 M'   },
                                    { value: 130,  name: '130 M'  },
                                    { value: 200,  name: '200 M'  },
                                    { value: 400,  name: '400 M'  },
                                    { value: 600,  name: '600 M'  },
                                    { value: 800,  name: '800 M'  },
                                    { value: 1000, name: '1000 M' },
                                    { value: 1200, name: '1200 M' },
                                    { value: 1400, name: '1400 M' },
                                    { value: 1600, name: '1600 M' }
                                ]
                            })
                        }
                    ]
                },
                store: 'PoolingTree',
                rootVisible: false,
                columns: [
                    {
                        xtype: 'treecolumn',
                        text: 'Library Name',
                        dataIndex: 'text',
                        sortable: true,
                        width: 250
                    },
                    {
                        text: 'Seq. Depth',
                        dataIndex: 'sequencingDepth',
                        width: 90
                    },
                    {
                        text: 'Read Length',
                        dataIndex: 'sequencingRunConditionName',
                        width: 100
                    },
                    {
                        text: 'Protocol',
                        dataIndex: 'libraryProtocolName',
                        width: 150
                    },
                    {
                        text: 'Index Type',
                        dataIndex: 'indexTypeName',
                        width: 90
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
                header: {
                    title: 'Pool',
                    height: 56
                },
                height: Ext.Element.getViewportHeight() - 94,
                flex: 1,
                features: [{
                    ftype: 'summary'
                }],
                // plugins: [{
                //     ptype: 'rowediting',
                //     clicksToEdit: 2
                // }],
                problematicCycles: [],
                columns: [
                    {
                        text: 'Name',
                        dataIndex: 'name',
                        width: 200
                    },
                    {
                        text: 'Seq. Depth',
                        dataIndex: 'sequencingDepth',
                        width: 90,
                        summaryType: 'sum',
                        summaryRenderer: function(value) {
                            return (value > 0) ? value : '';
                        },
                        // editor: {
                        //     xtype: 'numberfield',
                        //     minValue: 1
                        // }
                    },
                    {
                        text: 'Index I7 ID',
                        dataIndex: 'indexI7Id',
                        width: 90,
                        summaryRenderer: function() {
                            var totalSequencingDepth = Ext.getCmp('poolGrid').getStore().sum('sequencingDepth');
                            return (totalSequencingDepth > 0) ? 'green:<br>red:' : '';
                        }
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_1',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversityI7,
                        summaryRenderer: me.renderSummaryI7,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_2',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversityI7,
                        summaryRenderer: me.renderSummaryI7,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_3',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversityI7,
                        summaryRenderer: me.renderSummaryI7,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_4',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversityI7,
                        summaryRenderer: me.renderSummaryI7,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_5',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversityI7,
                        summaryRenderer: me.renderSummaryI7,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_6',
                        renderer: me.renderCell,
                        summaryType: me.calculateColorDiversityI7,
                        summaryRenderer: me.renderSummaryI7,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_7',
                        renderer: me.renderCell,
                        width: 55
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_8',
                        renderer: me.renderCell,
                        width: 55
                    }
                ],
                store: [],
                bbar: [
                    '->',
                    {
                        xtype: 'button',
                        id: 'savePool',
                        itemId: 'savePool',
                        text: 'Pool',
                        disabled: true
                    }
                ]
            }
        ];

        me.callParent(arguments);
    },

    renderCell: function(val, meta) {
        if (val == 'G' || val == 'T') {
            meta.tdStyle = 'background-color:#dcedc8;text-align:center;';
        } else if (val == 'A' || val == 'C') {
            meta.tdStyle = 'background-color:#ef9a9a';
        }
        return val;
    },

    calculateColorDiversityI7: function(records, values) {
        var diversity = {green: 0, red: 0};

        for (var i = 0; i < values.length; i++) {
            var nuc = values[i];
            if (nuc == 'G' || nuc == 'T') {
                diversity.green += records[i].get('sequencingDepth');
            } else {
                diversity.red += records[i].get('sequencingDepth');
            }
        }

        return diversity;
    },

    renderSummaryI7: function(value, summaryData, dataIndex) {
        var result = '',
            grid = Ext.getCmp('poolGrid');

        if (value.green > 0 || value.red > 0) {
            var totalSequencingDepth = grid.getStore().sum('sequencingDepth'),
                green = parseInt(((value.green / totalSequencingDepth) * 100).toFixed(0)),
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
