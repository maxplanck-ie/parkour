Ext.define('MainHub.store.tables.libraries.SampleProtocols', {
    extend: 'Ext.data.Store',
    storeId: 'sampleProtocolsStore',

    requires: [
        'MainHub.model.tables.libraries.SampleProtocol'
    ],

    model: 'MainHub.model.tables.libraries.SampleProtocol',

    proxy: {
        type: 'ajax',
        url: 'get_sample_protocols/',
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
                console.log('[ERROR]: get_sample_protocols(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
