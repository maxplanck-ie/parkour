Ext.define('MainHub.store.libraries.FileLibrary', {
    extend: 'Ext.data.Store',
    storeId: 'fileLibraryStore',

    requires: [
        'MainHub.model.libraries.FileLibrarySample'
    ],

    model: 'MainHub.model.libraries.FileLibrarySample',

    proxy: {
        type: 'ajax',
        url: 'get_file_library/',
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
                console.log('[ERROR]: get_file_library(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
