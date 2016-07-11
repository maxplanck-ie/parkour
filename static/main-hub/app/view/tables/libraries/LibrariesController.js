Ext.define('MainHub.view.tables.libraries.LibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-libraries',
    
    config: {
        control: {
            '#librariesTable': {
                
            },
            
            '#addLibraryBtn': {
                click: 'onAddLibraryBtnClick'
            }
        }
    },
    
    onAddLibraryBtnClick: function(btn) {
        Ext.create('library_wnd', {title: 'Add Library', mode: 'add'}).show();
    }
});
