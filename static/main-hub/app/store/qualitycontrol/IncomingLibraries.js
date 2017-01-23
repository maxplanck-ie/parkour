Ext.define('MainHub.store.qualitycontrol.IncomingLibraries', {
    extend: 'Ext.data.Store',
    storeId: 'incomingLibrariesStore',

    requires: [
        'MainHub.model.qualitycontrol.IncomingLibraries'
    ],

    model: 'MainHub.model.qualitycontrol.IncomingLibraries',

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
