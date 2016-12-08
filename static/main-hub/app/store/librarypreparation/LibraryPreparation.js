Ext.define('MainHub.store.librarypreparation.LibraryPreparation', {
    extend: 'Ext.data.Store',
    storeId: 'libraryPreparationStore',

    requires: [
        'MainHub.model.librarypreparation.LibraryPreparation'
    ],

    model: 'MainHub.model.librarypreparation.LibraryPreparation',

    groupField: 'libraryProtocolName',
    groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        url: 'library_preparation/get_all/',
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
