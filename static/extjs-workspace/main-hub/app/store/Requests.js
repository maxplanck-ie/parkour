Ext.define('MainHub.store.Requests', {
    extend: 'Ext.data.Store',
    storeId: 'requestsStore',

    requires: [
        'MainHub.model.tables.Request'
    ],

    model: 'MainHub.model.tables.Request',

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
    }
});
