Ext.define('MainHub.store.pooling.Pooling', {
    extend: 'Ext.data.Store',
    storeId: 'poolingStore',

    requires: [
        'MainHub.model.pooling.Pooling'
    ],

    model: 'MainHub.model.pooling.Pooling',

    groupField: 'poolName',
    // groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        api: {
            read: 'pooling/get_all/',
            update: 'pooling/update_all/'
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
                    var store = Ext.getStore('poolingStore');
                    var newData = _.map(data, function(item) {
                        var record = store.findRecord('id', item.id),
                            newItem = $.extend({}, item);
                        if (record) {
                            newItem = {
                                library_id: record.get('libraryId'),
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
    },

    listeners: {
        load: function(store, records, success, operation) {
            if (success) {
                // Remove 'Click to collapse' tooltip
                $('.x-grid-group-title').attr('data-qtip', '');
            }
        }
    }
});
