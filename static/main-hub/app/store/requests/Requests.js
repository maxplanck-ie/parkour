Ext.define('MainHub.store.requests.Requests', {
    extend: 'Ext.data.Store',
    storeId: 'requestsStore',

    requires: [
        'MainHub.model.requests.Request'
    ],

    model: 'MainHub.model.requests.Request',

    proxy: {
        type: 'ajax',
        url: 'get_requests/',
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
                var error = operation.error;
                Ext.ux.ToastMessage(error.statusText, 'error');
                console.error('[ERROR]: get_requests/: ' + error.statusText);
                console.error(error.response);
            }
        }
    }
});
