Ext.define('MainHub.store.tables.requests.LibrariesInRequest', {
    extend: 'Ext.data.Store',
    storeId: 'librariesInRequestStore',

    requires: [
        'MainHub.model.tables.requests.LibrariesInRequest'
    ],

    model: 'MainHub.model.tables.requests.LibrariesInRequest',

    proxy: {
        type: 'ajax',
        url: 'get_libraries_in_request/',
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
                console.error('[ERROR]: get_libraries_in_request/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
