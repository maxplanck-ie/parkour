Ext.define('MainHub.store.flowcell.PoolInfo', {
    extend: 'Ext.data.Store',
    storeId: 'poolInfoStore',

    requires: [
        'MainHub.model.flowcell.PoolInfo'
    ],

    model: 'MainHub.model.flowcell.PoolInfo',

    proxy: {
        type: 'ajax',
        url: 'flowcell/pool_info/',
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
