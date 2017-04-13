Ext.define('MainHub.store.incominglibraries.IncomingLibraries', {
    extend: 'Ext.data.Store',
    storeId: 'incomingLibrariesStore',

    requires: [
        'MainHub.model.incominglibraries.IncomingLibraries'
    ],

    model: 'MainHub.model.incominglibraries.IncomingLibraries',

    groupField: 'requestName',
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
        },
        extraParams: {
            'quality_check': true
        }
    }
});
