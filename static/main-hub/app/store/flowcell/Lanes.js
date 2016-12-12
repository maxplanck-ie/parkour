Ext.define('MainHub.store.flowcell.Lanes', {
    extend: 'Ext.data.Store',
    storeId: 'lanesStore',

    requires: [
        'MainHub.model.flowcell.Lane'
    ],

    model: 'MainHub.model.flowcell.Lane',

    // proxy: {
    //     type: 'ajax',
    //     url: 'flowcell/pool_list/',
    //     timeout: 1000000,
    //     pageParam: false,   //to remove param "page"
    //     startParam: false,  //to remove param "start"
    //     limitParam: false,  //to remove param "limit"
    //     noCache: false,     //to remove param "_dc",
    //     reader: {
    //         type: 'json',
    //         rootProperty: 'data',
    //         successProperty: 'success'
    //     }
    // }
});
