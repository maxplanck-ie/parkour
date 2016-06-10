Ext.define('MainHub.store.Researchers', {
    extend: 'Ext.data.Store',
    storeId: 'researchersStore',

    requires: [
        'MainHub.model.tables.Researcher'
    ],

    model: 'MainHub.model.tables.Researcher',

    proxy: {
        type: 'ajax',
        url: 'get_researchers/',
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
