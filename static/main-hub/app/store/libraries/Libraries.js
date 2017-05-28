Ext.define('MainHub.store.libraries.Libraries', {
    extend: 'Ext.data.Store',
    storeId: 'librariesStore',

    requires: [
        'MainHub.model.libraries.Library'
    ],

    model: 'MainHub.model.libraries.Library',

    // groupField: 'requestName',
    groupField: 'requestId',
    groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        url: 'library/get_all/',
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

    autoLoad: true
});
