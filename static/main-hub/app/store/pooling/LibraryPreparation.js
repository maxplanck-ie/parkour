Ext.define('MainHub.store.pooling.LibraryPreparation', {
    extend: 'Ext.data.TreeStore',
    storeId: 'libraryPreparationStore',

    requires: [
        'MainHub.model.pooling.LibraryPreparation'
    ],

    model: 'MainHub.model.pooling.LibraryPreparation',

    // groupField: 'libraryProtocol',
    // groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        url: 'get_library_preparation/',
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
    },

    autoLoad: true
});
