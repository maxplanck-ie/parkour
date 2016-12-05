Ext.define('MainHub.store.flowcell.Pool', {
    extend: 'Ext.data.Store',
    storeId: 'poolsStore',

    requires: [
        'MainHub.model.flowcell.Pool'
    ],

    model: 'MainHub.model.flowcell.Pool',

    proxy: {
        type: 'ajax',
        url: 'get_pools/',
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
