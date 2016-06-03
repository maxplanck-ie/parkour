Ext.define('MainHub.view.tables.Researchers', {
    extend: 'Ext.container.Container',
    xtype: 'researchers',

    requires: [
        'Ext.container.Container',
        'Ext.toolbar.Paging',
        'MainHub.view.tables.ResearchersController'
    ],

    controller: 'researchers',

    layout: 'fit',

    items: [
        {
            xtype: 'grid',
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
                    { text: 'First name', dataIndex: 'firstName' },
                    { text: 'Last name', dataIndex: 'lastName' },
                    { text: 'Telephone', dataIndex: 'telephone' },
                    { text: 'Email', dataIndex: 'email' },
                    { text: 'Principal Investigator', dataIndex: 'pi' },
                    { text: 'Organization', dataIndex: 'organization' },
                    { text: 'Cost Unit', dataIndex: 'costUnit' }
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
            ]
        }
    ]
});
