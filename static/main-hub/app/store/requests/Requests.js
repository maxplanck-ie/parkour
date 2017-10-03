Ext.define('MainHub.store.requests.Requests', {
    // extend: 'Ext.data.Store',
    extend: 'Ext.data.BufferedStore',
    storeId: 'requestsStore',

    requires: [
        'MainHub.model.requests.Request'
    ],

    model: 'MainHub.model.requests.Request',

    // remoteGroup: true,
    leadingBufferZone: 50,
    pageSize: 30,

    proxy: {
        type: 'ajax',
        url: 'api/requests/',
        // pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        reader: {
            type: 'json',
            rootProperty: 'results',
            totalProperty: 'count'
        },

        filterParam: 'query',
        // encodeFilters: function(filters) {
        //     return filters[0].value;
        // }
    },

    remoteFilter: true
});
