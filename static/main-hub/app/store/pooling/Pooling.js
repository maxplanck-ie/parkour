Ext.define('MainHub.store.pooling.Pooling', {
    extend: 'Ext.data.Store',
    storeId: 'poolingStore',

    requires: [
        'MainHub.model.pooling.Pooling'
    ],

    model: 'MainHub.model.pooling.Pooling',

    groupField: 'poolName',
    // groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        url: 'pooling/get_all/',
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
            if (success) {
                // Remove 'Click to collapse' tooltip
                $('.x-grid-group-title').attr('data-qtip', '');
            }
        }
    }
});
