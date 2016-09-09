Ext.define('MainHub.store.researchers.CostUnits', {
    extend: 'Ext.data.Store',
    storeId: 'costUnitsStore',

    requires: [
        'MainHub.model.researchers.CostUnit'
    ],

    model: 'MainHub.model.researchers.CostUnit',

    proxy: {
        type: 'ajax',
        url: 'get_cost_units/',
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
                console.error('[ERROR]: get_cost_units/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
