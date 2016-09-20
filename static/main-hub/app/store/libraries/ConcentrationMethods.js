Ext.define('MainHub.store.libraries.ConcentrationMethods', {
    extend: 'Ext.data.Store',
    storeId: 'concentrationMethodsStore',

    requires: [
        'MainHub.model.libraries.LibraryField'
    ],

    model: 'MainHub.model.libraries.LibraryField',

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

    autoLoad: true,

    listeners: {
        load: function(store, records, success, operation) {
            if (!success) {
                var response = operation._response,
                    obj = Ext.JSON.decode(response.responseText);
                Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');
                console.error('[ERROR]: get_concentration_methods/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
