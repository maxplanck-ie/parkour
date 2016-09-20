Ext.define('MainHub.store.libraries.SequencingRunConditions', {
    extend: 'Ext.data.Store',
    storeId: 'sequencingRunConditionsStore',

    requires: [
        'MainHub.model.libraries.LibraryField'
    ],

    model: 'MainHub.model.libraries.LibraryField',

    proxy: {
        type: 'ajax',
        url: 'get_sequencing_run_conditions/',
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
                Ext.ux.ToastMessage('Cannot load Sequencing Run Conditions', 'error');
                console.errorerror('[ERROR]: get_sequencing_run_conditions/: ' + obj.error);
                console.error(response);
            }
        }
    }
});
