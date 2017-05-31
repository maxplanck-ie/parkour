Ext.define('MainHub.store.flowcell.Flowcells', {
    extend: 'Ext.data.Store',
    storeId: 'flowcellsStore',
    requires: ['MainHub.model.flowcell.Flowcell'],
    model: 'MainHub.model.flowcell.Flowcell',

    groupField: 'flowcell',
    groupDir: 'DESC',

    proxy: {
        type: 'ajax',
        timeout: 1000000,
        pageParam: false,   //to remove param "page"
        startParam: false,  //to remove param "start"
        limitParam: false,  //to remove param "limit"
        noCache: false,     //to remove param "_dc",
        api: {
            read: 'flowcell/get_all/',
            update: 'flowcell/update_all/'
        },
        reader: {
            type: 'json',
            rootProperty: 'data',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            transform: {
                fn: function(data, request) {
                    if (!(data instanceof Array)) {
                        data = [data];
                    }
                    var store = Ext.getStore('flowcellsStore');
                    var newData = _.map(data, function(item) {
                        var record = store.findRecord('id', item.id);
                        var newItem = $.extend({}, item);
                        if (record) {
                            newItem = {
                                lane_id: record.get('laneId'),
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
