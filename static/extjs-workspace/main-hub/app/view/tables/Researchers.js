Ext.define('MainHub.view.tables.Researchers', {
    extend: 'Ext.container.Container',
    xtype: 'researchers',

    requires: [
        'Ext.container.Container',
        'Ext.toolbar.Paging',
        'Ext.grid.plugin.RowEditing',
        'MainHub.view.tables.ResearchersController'
    ],

    controller: 'researchers',

    anchor : '100% -1',
    layout: 'fit',

    items: [
        {
            xtype: 'grid',
            id: 'researchersTable',
            itemId: 'researchersTable',
            padding: 15,

            header: {
                title: 'Researchers',
                items: [
                    { xtype: 'button', text: 'Add' }
                ]
            },

            store: [],

            columns: {
                items: [
                    { text: 'First name', dataIndex: 'firstName', editor: { xtype: 'textfield', allowBlank: false } },
                    { text: 'Last name', dataIndex: 'lastName', editor: { xtype: 'textfield', allowBlank: false } },
                    { text: 'Telephone', dataIndex: 'telephone', editor: { xtype: 'textfield', allowBlank: false } },
                    { text: 'Email', dataIndex: 'email', editor: { xtype: 'textfield', allowBlank: false } },
                    { text: 'Principal Investigator', dataIndex: 'pi', editor: { xtype: 'textfield', allowBlank: false } },
                    { text: 'Organization', dataIndex: 'organization', editor: { xtype: 'textfield', allowBlank: false } },
                    { text: 'Cost Unit', dataIndex: 'costUnit', editor: { xtype: 'textfield', allowBlank: false } }
                ],
                defaults: {
                    flex: 1
                }
            },

            dockedItems: [
                {
                    xtype: 'pagingtoolbar',
                    dock: 'bottom',
                    displayInfo: true
                }
            ],

            plugins: [
                {
                    ptype: 'rowediting',
                    pluginId: 'editResearcher',
                    clicksToMoveEditor: 1,
                    autoCancel: false,
                    // listeners: {
                    //     edit: function() {
                    //         debugger;
                    //     }
                    // }
                }
            ]
        }
    ]
});
