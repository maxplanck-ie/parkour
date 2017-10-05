Ext.define('MainHub.view.requests.Requests', {
    extend: 'Ext.container.Container',
    xtype: 'requests',

    requires: [
        'MainHub.view.requests.RequestsController',
        'MainHub.view.requests.RequestWindow',
        'MainHub.view.requests.EmailWindow',
        'MainHub.view.libraries.LibraryWindow',
        'Ext.ux.form.SearchField'
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
                xtype: 'searchfield',
                store: 'requestsStore',
                emptyText: 'Search',
                margin: '0 15px 0 0',
                width: 250,
                disabled: true
            },
            {
                xtype: 'button',
                itemId: 'addRequestBtn',
                text: 'Add'
            }]
        },
        viewConfig: {
            // loadMask: false
            emptyText: '<h1 style="text-align:center;margin:75px">No matching results</h1>'
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
                    dataIndex: 'create_time',
                    flex: 1,
                    renderer: Ext.util.Format.dateRenderer('d.m.Y')
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
