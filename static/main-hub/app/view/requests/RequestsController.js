Ext.define('MainHub.view.requests.RequestsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests',

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#requestsTable': {
                boxready: 'boxready',
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

    activateView: function() {
        Ext.getStore('requestsStore').reload();
    },

    boxready: function() {
        // Hide the User column for non-administrators
        if (!USER_IS_STAFF) {
            Ext.getCmp('requestsTable').down('[dataIndex=user]').setVisible(false);
        }
        // Ext.getStore('requestsStore').reload();
    },

    refresh: function() {
        Ext.getStore('requestsStore').reload();
    },

    addRequest: function(btn) {
        Ext.create('MainHub.view.requests.RequestWindow', {
            title: 'Add Request',
            mode: 'add'
        }).show();
    },

    search: function(fld, query) {
        var grid = Ext.getCmp('requestsTable');
        var store = grid.getStore();
        var columns = Ext.pluck(grid.getColumns(), 'dataIndex');

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
        var items = [{
            text: 'Edit',
            iconCls: 'x-fa fa-pencil',
            handler: function() {
                Ext.create('MainHub.view.requests.RequestWindow', {
                    title: 'Edit Request',
                    mode: 'edit',
                    record: record
                }).show();
            }
        }];
        var deleteRequestOption = {
            text: 'Delete',
            iconCls: 'x-fa fa-trash',
            handler: function() {
                Ext.Msg.show({
                    title: 'Delete request',
                    message: 'Are you sure you want to delete the request?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    fn: function(btn) {
                        if (btn === 'yes') {me.deleteRequest(record);}
                    }
                });
            }
        };

        if (!USER_IS_STAFF && !record.get('restrictPermissions')) {
            items.push(deleteRequestOption);
        } else if (USER_IS_STAFF) {
            items.push(deleteRequestOption);
            items.push('-');
            items.push({
                text: 'Compose an Email',
                iconCls: 'x-fa fa-envelope-o',
                handler: function() {
                    Ext.create('MainHub.view.requests.EmailWindow', {
                            // title: 'New Email: ' + record.get('name'),
                        title: 'New Email',
                        record: record
                    });
                }
            });
        }

        e.stopEvent();
        Ext.create('Ext.menu.Menu', { items: items }).showAt(e.getXY());
    },

    deleteRequest: function(record) {
        Ext.Ajax.request({
            url: 'request/delete/',
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
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error(response);
            }
        });
    }
});
