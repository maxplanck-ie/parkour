Ext.define('MainHub.view.tables.researchers.Researchers', {
    extend: 'Ext.container.Container',
    xtype: 'researchers',

    requires: [
        'Ext.container.Container',
        'Ext.toolbar.Paging',
        'Ext.grid.plugin.RowEditing',
        'MainHub.view.tables.researchers.ResearchersController',
        'MainHub.view.tables.researchers.ResearcherWindow'
    ],

    controller: 'researchers',

    anchor : '100% -1',
    layout: 'fit',

    items: [
        {
            xtype: 'grid',
            id: 'researchersTable',
            itemId: 'researchersTable',
            height: Ext.Element.getViewportHeight() - 64,
            region: 'center',
            padding: 15,

            header: {
                title: 'Researchers',
                items: [
                    {
                        xtype: 'textfield',
                        itemId: 'searchField',
                        emptyText: 'Search',
                        width: 200,
                        margin: '0 15px 0 0'
                    },
                    {
                        xtype: 'button',
                        itemId: 'addResearcherBtn',
                        text: 'Add'
                    }
                ]
            },

            store: 'researchersStore',

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

            plugins: [
                {
                    ptype: 'rowediting',
                    pluginId: 'editResearcher',
                    clicksToMoveEditor: 1,
                    autoCancel: false
                },
                {
                    ptype: 'bufferedrenderer',
                    trailingBufferZone: 100,
                    leadingBufferZone: 100
                }
            ]
        }
    ]
});
