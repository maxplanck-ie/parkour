Ext.define('MainHub.view.pooling.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    requires: [],

    config: {
        control: {
            '#': {
                boxready: 'onLibraryPreparationBoxready'
            }
        }
    },

    onLibraryPreparationBoxready: function() {
        Ext.getStore('libraryPreparationStore').load();
    }
});
