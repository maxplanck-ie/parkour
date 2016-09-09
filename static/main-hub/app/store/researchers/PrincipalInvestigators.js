Ext.define('MainHub.store.researchers.PrincipalInvestigators', {
    extend: 'Ext.data.Store',
    storeId: 'principalInvestigatorsStore',

    requires: [
        'MainHub.model.researchers.PrincipalInvestigator'
    ],

    model: 'MainHub.model.researchers.PrincipalInvestigator',

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
                console.error('[ERROR]: get_pis/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
