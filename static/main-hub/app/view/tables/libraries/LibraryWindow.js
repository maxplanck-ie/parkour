Ext.define('MainHub.view.tables.libraries.LibraryWindow', {
    extend: 'Ext.window.Window',
    alias: 'library_wnd',
    xtype: 'library_wnd',

    requires: ['MainHub.view.tables.libraries.LibraryWindowController'],

    controller: 'tables-libraries-librarywindow',

    height: 600,
    width: 500,

    modal: true,
    resizable: false,

    items: [
        {
            xtype: 'form',
            // id: 'libraryForm',
            // itemId: 'libraryForm',
            layout: 'anchor',
            border: 0,
            padding: 15,

            defaultType: 'textfield',
            defaults: {
                submitEmptyText: false,
                allowBlank: false,
                anchor: '100%'
            },

            items: [
                {
                    name: 'test',
                    fieldLabel: 'Test',
                    emptyText: 'Test'
                }
            ]
        }
    ],

    bbar: [
        '->',
        {
            xtype: 'button',
            itemId: 'cancelBtn',
            text: 'Cancel'
        },
        {
            xtype: 'button',
            itemId: 'addLibraryWndBtn',
            id: 'addLibraryWndBtn',
            text: 'Add',
            hidden: true
        },
        {
            xtype: 'button',
            itemId: 'editLibraryWndBtn',
            id: 'editLibraryWndBtn',
            text: 'Update',
            hidden: true
        }
    ]
});