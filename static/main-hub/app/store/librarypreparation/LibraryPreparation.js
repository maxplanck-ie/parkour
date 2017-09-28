Ext.define('MainHub.store.librarypreparation.LibraryPreparation', {
    extend: 'Ext.data.Store',
    storeId: 'libraryPreparationStore',

    requires: [
        'MainHub.model.librarypreparation.LibraryPreparation'
    ],

    model: 'MainHub.model.librarypreparation.LibraryPreparation',

    groupField: 'libraryProtocol',
    // groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        api: {
            read: 'library_preparation/get_all/',
            update: 'library_preparation/update_all/'
        },
        reader: {
            type: 'json',
            rootProperty: 'data',
            successProperty: 'success',
            messageProperty: 'error'
        },
        writer: {
            type: 'json',
            transform: {
                fn: function(data, request) {
                    if (!(data instanceof Array)) {
                        data = [data];
                    }
                    var store = Ext.getStore('libraryPreparationStore');
                    var newData = _.map(data, function(item) {
                        var record = store.findRecord('id', item.id),
                            newItem = $.extend({}, item);
                        if (record) {
                            newItem = {
                                sample_id: record.get('sampleId'),
                                changed_value: record.getChanges()
                            };
                        }
                        return newItem;
                    });
                    return newData;
                },
                scope: this
            }
        }
    }
});
