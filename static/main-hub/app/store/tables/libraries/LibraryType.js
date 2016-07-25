Ext.define('MainHub.store.tables.libraries.LibraryType', {
    extend: 'Ext.data.Store',
    storeId: 'libraryTypeStore',

    requires: [
        'MainHub.model.tables.libraries.LibraryType'
    ],

    model: 'MainHub.model.tables.libraries.LibraryType',

    proxy: {
        type: 'ajax',
        url: 'get_library_type/',
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

    listeners: {
        load: function(store, records, success, operation) {
            if (!success) {
                var response = operation._response,
                    obj = Ext.JSON.decode(response.responseText);
                console.log('[ERROR]: get_library_type(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
