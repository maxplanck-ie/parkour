Ext.define('MainHub.view.tables.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-librarywindow',

    config: {
        control: {
            '#': {
                boxready: 'onLibraryWindowBoxready'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onLibraryWindowBoxready: function(wnd) {
        if (wnd.mode == 'add') {
            Ext.getCmp('saveAndAddLibraryWndBtn').show();
            Ext.getCmp('addLibraryWndBtn').show();
        } else {

        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('library_wnd').close();
    }
});
