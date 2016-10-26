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

    defaultType: 'panel',
    items: [
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
                        itemId: 'poolSize',
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'value',
                        // emptyText: '25 M',
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
                    flex: 1
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
            header: {
                title: 'Pool',
                height: 56
            },
            height: Ext.Element.getViewportHeight() - 94,
            flex: 1,
            
            bbar: [
                '->',
                {
                    xtype: 'button',
                    itemId: 'savePool',
                    text: 'Save',
                    disabled: true
                }
            ]
        },
        // {
        //     header: {
        //         title: 'Pooling',
        //         height: 56
        //     },
        //     layout: {
        //         type: 'vbox',
        //         align: 'stretch'
        //     },
        //     flex: 1,
        //     // width: 350,
        //     items: [{
        //         html: `
        //             <div style="font-family:Monospace;font-size:25px;">
        //                 <span style="color:green">G</span>
        //                 <span style="color:red">C</span>
        //             <div>
        //         `,
        //         border: 0,
        //         padding: 15
        //     }],
        //     bbar: [
        //         '->',
        //         {
        //             xtype: 'button',
        //             itemId: 'savePool',
        //             text: 'Pool'
        //         }
        //     ]
        // }
    ]
});
