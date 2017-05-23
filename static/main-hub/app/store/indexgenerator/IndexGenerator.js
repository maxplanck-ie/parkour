Ext.define('MainHub.store.indexgenerator.IndexGenerator', {
    extend: 'Ext.data.Store',
    storeId: 'indexGeneratorStore',

    requires: [
        'MainHub.model.indexgenerator.Record'
    ],

    model: 'MainHub.model.indexgenerator.Record',

    groupField: 'requestId',
    groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        api: {
            read: 'index_generator/get_all/',
            update: 'index_generator/update_all/'
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
                    var store = Ext.getStore('indexGeneratorStore');
                    var newData = _.map(data, function(item) {
                        var record = store.findRecord('id', item.id),
                            newItem = $.extend({}, item);
                        if (record) {
                            newItem = {
                                record_type: record.get('recordType'),
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
    }
});
