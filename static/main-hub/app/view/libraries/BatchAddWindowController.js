Ext.define('MainHub.view.libraries.BatchAddWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-batchaddwindow',

    config: {
        control: {
            '#batchAddGrid': {
                itemcontextmenu: 'showContextMenu',
                edit: 'editRecord'
            },
            '#createEmptyRecordsBtn': {
                click: 'createEmptyRecords'
            },
            '#saveBtn': {
                click: 'save'
            }
        }
    },

    showContextMenu: function(gridView, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Apply to All',
                iconCls: 'x-fa fa-check-circle',
                handler: function() {
                    var dataIndex = me.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            }, {
                text: 'Delete',
                iconCls: 'x-fa fa-trash',
                handler: function() {
                    me.delete(record, gridView);
                }
            }]
        }).showAt(e.getXY());
    },

    createEmptyRecords: function(btn) {
        var grid = Ext.getCmp('batchAddGrid'),
            store = grid.getStore(),
            numRecords = btn.up().down('#numEmptyRecords').getValue();

        if (numRecords !== null && numRecords > 0) {
            for (var index = 0; index < numRecords; index++) {
                store.add({
                    concentration: 0
                });
            }
        }
    },

    applyToAll: function(record, dataIndex) {
        var store = record.store
        if (typeof dataIndex !== 'undefined') {
            if (dataIndex === 'name') {
                Ext.ux.ToastMessage('Names must be unique.', 'warning');
                return;
            }

            store.each(function(item) {
                if (item !== record) {
                    item.set(dataIndex, record.get(dataIndex));
                    item.save();
                }
            });
        }
    },

    delete: function(record, gridView) {
        var store = record.store;
        store.remove(record);
        gridView.refresh();
    },

    editRecord: function(editor, context) {
        var grid = Ext.getCmp('batchAddGrid'),
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues;

        for (var dataIndex in changes) {
            if (changes.hasOwnProperty(dataIndex)) {
                record.set(dataIndex, changes[dataIndex]);
            }
        }
        record.save();
    },

    save: function() {

    },

    getDataIndex: function(e, view) {
        var xPos = e.getXY()[0],
            columns = view.getGridColumns(),
            dataIndex;

        for(var column in columns) {
            var leftEdge = columns[column].getPosition()[0],
                rightEdge = columns[column].getSize().width + leftEdge;

            if(xPos >= leftEdge && xPos <= rightEdge) {
                dataIndex = columns[column].dataIndex;
                break;
            }
        }

        return dataIndex;
    }
});
