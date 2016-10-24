Ext.define('MainHub.store.pooling.PoolingTree', {
    extend: 'Ext.data.TreeStore',

    storeId: 'PoolingTree',

    proxy: {
        type: 'ajax',
        url: 'get_pooling_tree/',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        reader: {
            type: 'json',
        }
    }
});
