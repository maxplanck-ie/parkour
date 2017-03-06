Ext.define('MainHub.view.libraries.BatchAddWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-batchaddwindow',

    config: {
        control: {
            '#batchAddGrid': {
                itemcontextmenu: 'showContextMenu',
                edit: 'edit'
            },
            '#addBtn': {
                click: 'add'
            }
        }
    },

    showContextMenu: function(gridView, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: 'Apply to All',
                    iconCls: 'x-fa fa-check-circle',
                    handler: function() {
                        // TODO@me: get dataIndex
                        me.applyToAll(record);
                    }
                }, {
                    text: 'Delete',
                    iconCls: 'x-fa fa-trash',
                    handler: function() {
                        me.delete(gridView, record);
                    }
                }
            ]
        }).showAt(e.getXY());
    },

    applyToAll: function(record) {
        var store = record.store;
    },

    delete: function(record, gridView) {
        var store = record.store;
        store.remove(record);
        gridView.refresh();
    },

    edit: function(editor, context) {

    },

    add: function() {

    }
});
