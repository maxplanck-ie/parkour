Ext.define('MainHub.view.pooling.Pooling', {
    extend: 'Ext.container.Container',
    xtype: 'pooling',

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
                ],
                bbar: [
                    '->',
                    {
                        xtype: 'button',
                        itemId: 'createPool',
                        text: 'Pool'
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
                columns: [
                    {
                        text: 'Name',
                        dataIndex: 'name',
                        width: 250
                    },
                    {
                        text: 'Seq. Depth',
                        dataIndex: 'sequencingDepth',
                        width: 90
                    },
                    {
                        text: 'Index I7 ID',
                        dataIndex: 'indexI7Id',
                        width: 90
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_1',
                        renderer: me.renderCell,
                        // summaryType: function(records, values) {
                        //     var count = {};
                        //     for (var i = 0; i < values.length; i++) {
                        //         var nuc = values[i];
                        //         count[nuc] = count[nuc] ? count[nuc] + 1 : 1;
                        //     }
                        //     return count;
                        // },
                        // summaryRenderer: function(value, summaryData, dataIndex) {
                        //     return 'X' + '%';
                        // },
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_2',
                        renderer: me.renderCell,
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_3',
                        renderer: me.renderCell,
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_4',
                        renderer: me.renderCell,
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_5',
                        renderer: me.renderCell,
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_6',
                        renderer: me.renderCell,
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_7',
                        renderer: me.renderCell,
                        width: 30
                    },
                    {
                        text: '',
                        dataIndex: 'indexI7_8',
                        renderer: me.renderCell,
                        width: 30
                    }
                ],
                store: [],
                bbar: [
                    '->',
                    {
                        xtype: 'button',
                        itemId: 'savePool',
                        text: 'Save',
                        disabled: true
                    }
                ],
                html: '<div class="myText">!!! TEXT !!!</div>'
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
        return val;
    }
});
