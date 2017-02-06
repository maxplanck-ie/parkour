Ext.define('MainHub.view.startpage.RequestsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests',

    config: {
        control: {
            '#requestsTable': {
                boxready: 'refresh',
                refresh: 'refresh',
                itemcontextmenu: 'showContextMenu'
            },
            '#addRequestBtn': {
                click: 'addRequest'
            },
            '#searchField': {
                change: 'search'
            }
        }
    },

    refresh: function() {
        Ext.getStore('requestsStore').reload();
    },

    addRequest: function(btn) {
        Ext.create('MainHub.view.startpage.RequestWindow', {
            title: 'Add Request',
            mode: 'add'
        }).show();
    },

    search: function(fld, query) {
        var grid = Ext.getCmp('requestsTable'),
            store = grid.getStore(),
            columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column].toString().toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });

        // grid.setHeight(Ext.Element.getViewportHeight() - 64);
    },

    showContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                    text: 'Edit',
                    iconCls: 'x-fa fa-pencil',
                    handler: function() {
                        me.editRequest(record);
                    }
                },
                {
                    text: 'Delete',
                    iconCls: 'x-fa fa-trash',
                    handler: function() {
                        Ext.Msg.show({
                            title: 'Delete request',
                            message: 'Are you sure you want to delete the request?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            fn: function(btn) {
                                if (btn == 'yes') me.deleteRequest(record);
                            }
                        });
                    }
                }
            ]
        }).showAt(e.getXY());
    },

    editRequest: function(record) {
        Ext.create('MainHub.view.startpage.RequestWindow', {
            title: 'Edit Request',
            mode: 'edit',
            record: record
        }).show();
    },

    deleteRequest: function(record) {
        var url = 'request/delete/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: {
                'request_id': record.data.requestId
            },

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    MainHub.Utilities.reloadAllStores();
                    Ext.ux.ToastMessage('Record has been deleted!');
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url);
                    console.error(response);
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
                console.error(response);
            }
        });
    }
});
