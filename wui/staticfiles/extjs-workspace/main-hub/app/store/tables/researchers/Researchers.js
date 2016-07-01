Ext.define('MainHub.store.tables.researchers.Researchers', {
    extend: 'Ext.data.Store',
    storeId: 'researchersStore',

    requires: [
        'MainHub.model.tables.researchers.Researcher'
    ],

    model: 'MainHub.model.tables.researchers.Researcher',

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

    listeners: {
        load: function(store, records, success, operation) {
            if (!success) {
                var response = operation._response,
                    obj = Ext.JSON.decode(response.responseText);
                console.log('[ERROR]: get_researchers(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
