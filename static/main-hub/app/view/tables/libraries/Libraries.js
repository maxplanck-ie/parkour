Ext.define('MainHub.view.tables.libraries.Libraries', {
    extend: 'Ext.container.Container',
    xtype: 'libraries',

    requires: [
        'MainHub.view.tables.libraries.LibrariesController',
        'MainHub.view.tables.libraries.LibraryWindow'
    ],

    controller: 'tables-libraries-libraries',

    anchor : '100% -1',
    layout: 'fit',

    items: [
        {
            xtype: 'grid',
            id: 'librariesTable',
            itemId: 'librariesTable',
            height: Ext.Element.getViewportHeight() - 64,
            region: 'center',
            padding: 15,

            header: {
                title: 'Libraries',
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
                        itemId: 'addLibraryBtn',
                        text: 'Add'
                    }
                ]
            },

            store: [],

            columns: [],

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
