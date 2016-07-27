Ext.define('MainHub.store.tables.libraries.ConcentrationMethods', {
    extend: 'Ext.data.Store',
    storeId: 'concentrationMethodsStore',

    requires: [
        'MainHub.model.tables.libraries.LibraryField'
    ],

    model: 'MainHub.model.tables.libraries.LibraryField',

    proxy: {
        type: 'ajax',
        url: 'get_concentration_methods/',
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
                console.log('[ERROR]: get_concentration_methods(): ' + obj.error);
                console.log(response);
            }
        }
    }
});
