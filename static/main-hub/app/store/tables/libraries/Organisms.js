Ext.define('MainHub.store.tables.libraries.Organisms', {
    extend: 'Ext.data.Store',
    storeId: 'organismsStore',

    requires: [
        'MainHub.model.tables.libraries.Organism'
    ],

    model: 'MainHub.model.tables.libraries.Organism',

    proxy: {
        type: 'ajax',
        url: 'get_organisms/',
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
                console.log('[ERROR]: get_organisms(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
