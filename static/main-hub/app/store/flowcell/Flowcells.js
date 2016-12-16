Ext.define('MainHub.store.flowcell.Flowcells', {
    extend: 'Ext.data.Store',
    storeId: 'flowcellsStore',

    requires: [
        'MainHub.model.flowcell.Flowcell'
    ],

    model: 'MainHub.model.flowcell.Flowcell',

    proxy: {
        type: 'ajax',
        url: 'flowcell/get_all/',
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
