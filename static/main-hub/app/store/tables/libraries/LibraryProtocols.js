Ext.define('MainHub.store.tables.libraries.LibraryProtocols', {
    extend: 'Ext.data.Store',
    storeId: 'libraryProtocolsStore',

    requires: [
        'MainHub.model.tables.libraries.LibraryProtocol'
    ],

    model: 'MainHub.model.tables.libraries.LibraryProtocol',

    proxy: {
        type: 'ajax',
        url: 'get_library_protocols/',
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
                console.log('[ERROR]: get_library_protocols(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
