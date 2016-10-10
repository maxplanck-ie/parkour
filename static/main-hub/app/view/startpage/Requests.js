Ext.define('MainHub.view.startpage.Requests', {
    extend: 'Ext.container.Container',
    xtype: 'requests',

    requires: [
        'MainHub.view.startpage.RequestsController',
        'MainHub.view.startpage.RequestWindow',
        'MainHub.view.libraries.LibraryWindow'
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
                    { text: 'Status', dataIndex: 'status', width: 60, 
                        renderer: function(value, meta) {
                            var statusClass = 'request-status pending-submission';
                            if (value == 0) {
                                meta.tdAttr = 'data-qtip="Pending submission"';

                            }
                            return '<div class="' + statusClass + '"></div>';
                        }
                    },
                    { text: 'Name', dataIndex: 'name', flex: 1 },
                    { text: 'Researcher', dataIndex: 'researcher', flex: 1 },
                    { text: 'Date Created', dataIndex: 'dateCreated', flex: 1 },
                    { text: 'Description', dataIndex: 'description', flex: 1,
                        renderer: function(value, meta) {
                            meta.tdAttr = 'data-qtip="' + value + '" data-qwidth=300';
                            return value;
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
