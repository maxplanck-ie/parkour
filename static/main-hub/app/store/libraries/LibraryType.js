Ext.define('MainHub.store.libraries.LibraryType', {
    extend: 'Ext.data.Store',
    storeId: 'libraryTypeStore',

    requires: [
        'MainHub.model.libraries.LibraryField'
    ],

    model: 'MainHub.model.libraries.LibraryField',

    proxy: {
        type: 'ajax',
        url: 'library/library_type/',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        reader: {
            type: 'json',
            rootProperty: 'data',
            successProperty: 'success'
        }
    }
});
