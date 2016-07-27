Ext.define('MainHub.view.tables.libraries.LibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-libraries',
    
    config: {
        control: {
            '#librariesTable': {
                boxready: 'onLibrariesTableBoxready',
                refresh: 'onLibrariesTableRefresh'
            },
            
            '#addLibraryBtn': {
                click: 'onAddLibraryBtnClick'
            }
        }
    },

    onLibrariesTableBoxready: function(grid) {
        // Triggers when the table is shown for the first time
        grid.fireEvent('refresh', grid);
    },

    onLibrariesTableRefresh: function(grid) {
        // Reload the table
        grid.getStore().removeAll();
        grid.getStore().reload();
    },
    
    onAddLibraryBtnClick: function(btn) {
        Ext.create('library_wnd', {title: 'Add Library', mode: 'add'}).show();
    }
});
