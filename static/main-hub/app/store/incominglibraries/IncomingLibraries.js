Ext.define('MainHub.store.incominglibraries.IncomingLibraries', {
    extend: 'Ext.data.Store',
    storeId: 'incomingLibrariesStore',

    requires: [
        'MainHub.model.incominglibraries.IncomingLibraries'
    ],

    model: 'MainHub.model.incominglibraries.IncomingLibraries',

    groupField: 'requestName',
    groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        api: {
            read: 'library/get_all/?quality_check=true',
            update: 'quality_check/update_all/'
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
                    var store = Ext.getStore('incomingLibrariesStore');
                    var newData = _.map(data, function(item) {
                        var record = store.findRecord('id', item.id),
                            newItem = $.extend({}, item);
                        if (record) {
                            var recordType = record.getRecordType();
                            newItem = {
                                record_type: recordType,
                                record_id: record.getRecordType() === 'L' ? record.get('libraryId') : record.get('sampleId'),
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
