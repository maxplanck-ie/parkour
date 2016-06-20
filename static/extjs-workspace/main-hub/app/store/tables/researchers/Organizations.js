Ext.define('MainHub.store.tables.researchers.Organizations', {
    extend: 'Ext.data.Store',
    storeId: 'organizationsStore',

    requires: [
        'MainHub.model.tables.researchers.Organization'
    ],

    model: 'MainHub.model.tables.researchers.Organization',

    proxy: {
        type: 'ajax',
        url: 'get_organizations/',
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
                console.log('[ERROR]: get_organizations(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
