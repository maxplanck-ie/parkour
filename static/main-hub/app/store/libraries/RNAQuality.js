Ext.define('MainHub.store.libraries.RNAQuality', {
    extend: 'Ext.data.Store',
    storeId: 'rnaQualityStore',

    requires: [
        'MainHub.model.libraries.LibraryField'
    ],

    model: 'MainHub.model.libraries.LibraryField',

    proxy: {
        type: 'ajax',
        url: 'get_rna_qualities/',
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
                console.error('[ERROR]: get_organisms/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
