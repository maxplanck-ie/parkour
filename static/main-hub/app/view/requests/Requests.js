Ext.define('MainHub.view.requests.Requests', {
    extend: 'Ext.container.Container',
    xtype: 'requests',

    requires: [
        'MainHub.view.requests.RequestsController',
        'MainHub.view.requests.RequestWindow',
        'MainHub.view.requests.EmailWindow',
        'MainHub.view.libraries.LibraryWindow'
    ],

    controller: 'requests',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'requestsTable',
        itemId: 'requestsTable',
        height: Ext.Element.getViewportHeight() - 64,
        region: 'center',
        padding: 15,
        header: {
            title: 'Requests',
            items: [{
                xtype: 'textfield',
                itemId: 'searchField',
                emptyText: 'Search',
                width: 200,
                margin: '0 15px 0 0'
            },
            {
                xtype: 'button',
                itemId: 'addRequestBtn',
                text: 'Add'
            }
            ]
        },
        viewConfig: {
            // loadMask: false
        },
        store: 'requestsStore',
        sortableColumns: false,
        columns: {
            items: [
                {
                    text: 'Name',
                    dataIndex: 'name',
                    flex: 1,
                    renderer: function(value, meta) {
                        var request = meta.record.data;
                        if (request.files.length > 0) {
                            value += '<span style="float:right"><i class="fa fa-paperclip" aria-hidden="true"></i></span>';
                        }
                        return value;
                    }
                },
                {
                    text: 'User',
                    dataIndex: 'user_full_name',
                    flex: 1
                },
                {
                    text: 'Date',
                    dataIndex: 'date',
                    flex: 1
                },
                {
                    text: 'Sum of Sequencing Depth',
                    dataIndex: 'sum_seq_depth',
                    flex: 1
                },
                {
                    text: 'Description',
                    dataIndex: 'description',
                    flex: 1,
                    renderer: function(value, meta) {
                        meta.tdAttr = 'data-qtip="' + value + '" data-qwidth=300';
                        return value;
                    }
                }
            ]
        },
        plugins: [{
            ptype: 'bufferedrenderer',
            trailingBufferZone: 100,
            leadingBufferZone: 100
        }]
    }]
});
