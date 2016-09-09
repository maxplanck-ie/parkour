Ext.define('MainHub.store.libraries.FileSample', {
    extend: 'Ext.data.Store',
    storeId: 'fileSampleStore',

    requires: [
        'MainHub.model.libraries.FileLibrarySample'
    ],

    model: 'MainHub.model.libraries.FileLibrarySample',

    proxy: {
        type: 'ajax',
        url: 'get_file_sample/',
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
                console.log('[ERROR]: get_file_sample(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
