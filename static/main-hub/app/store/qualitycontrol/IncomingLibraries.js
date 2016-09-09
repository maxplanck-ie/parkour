Ext.define('MainHub.store.qualitycontrol.IncomingLibraries', {
    extend: 'Ext.data.Store',
    storeId: 'incomingLibrariesStore',

    requires: [
        'MainHub.model.qualitycontrol.IncomingLibraries'
    ],

    model: 'MainHub.model.qualitycontrol.IncomingLibraries',

    groupField: 'requestName',
    groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        url: 'get_libraries/',
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
                console.error('[ERROR]: get_libraries/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
