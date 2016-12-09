Ext.define('MainHub.store.libraries.SampleProtocols', {
    extend: 'Ext.data.Store',
    storeId: 'sampleProtocolsStore',

    requires: [
        'MainHub.model.libraries.SampleProtocol'
    ],

    model: 'MainHub.model.libraries.SampleProtocol',

    proxy: {
        type: 'ajax',
        url: 'sample/sample_protocols/',
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
                console.error('[ERROR]: get_sample_protocols/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
