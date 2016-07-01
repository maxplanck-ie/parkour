Ext.define('MainHub.store.tables.researchers.PrincipalInvestigators', {
    extend: 'Ext.data.Store',
    storeId: 'principalInvestigatorsStore',

    requires: [
        'MainHub.model.tables.researchers.PrincipalInvestigator'
    ],

    model: 'MainHub.model.tables.researchers.PrincipalInvestigator',

    proxy: {
        type: 'ajax',
        url: 'get_pis/',
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
                console.log('[ERROR]: get_pis(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
