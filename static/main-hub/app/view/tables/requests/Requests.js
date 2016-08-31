Ext.define('MainHub.view.tables.requests.Requests', {
    extend: 'Ext.container.Container',
    xtype: 'requests',

    requires: [
        'MainHub.view.tables.requests.RequestsController',
        'MainHub.view.tables.requests.RequestWindow'
    ],

    controller: 'requests',

    anchor : '100% -1',
    layout: 'fit',

    items: [
        {
            xtype: 'grid',
            id: 'requestsTable',
            itemId: 'requestsTable',
            height: Ext.Element.getViewportHeight() - 64,
            region: 'center',
            padding: 15,

            header: {
                title: 'Requests',
                items: [
                    {
                        xtype: 'textfield',
                        itemId: 'searchField',
                        emptyText: 'Search',
                        width: 200,
                        margin: '0 15px 0 0',
                        disabled: true
                    },
                    {
                        xtype: 'button',
                        itemId: 'addRequestBtn',
                        text: 'Add'
                    }
                ]
            },

            store: 'requestsStore',

            columns: {
                items: [
                    { text: 'Status', dataIndex: 'status', width: 60 },
                    { text: 'Name', dataIndex: 'name', flex: 1 },
                    { text: 'Project Type', dataIndex: 'projectType', flex: 1 },
                    { text: 'Researcher', dataIndex: 'researcher', flex: 1 },
                    { text: 'Date Created', dataIndex: 'dateCreated', flex: 1 },
                    { text: 'Description', dataIndex: 'description', flex: 1,
                        renderer: function(value, metaData) {
                            metaData.tdAttr = 'data-qtip="' + value + '" data-qwidth=300';
                            return value;
                        }
                    },
                    { text: 'Terms of Use (accept)', dataIndex: 'termsOfUseAccept', flex: 1,
                        renderer: function(value) {
                            var checked = value ? 'checked' : '';
                            return '<input type="checkbox" ' + checked + ' onclick="return false;" onkeydown="return false;" />';
                        }
                    }
                ]
            },

            plugins: [
                {
                    ptype: 'bufferedrenderer',
                    trailingBufferZone: 100,
                    leadingBufferZone: 100
                }
            ]
        }
    ]
});
