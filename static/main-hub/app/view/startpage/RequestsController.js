Ext.define('MainHub.view.startpage.RequestsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests',

    config: {
        control: {
            '#requestsTable': {
                boxready: 'onRequestsTableRefresh',
                refresh: 'onRequestsTableRefresh',
                itemcontextmenu: 'onRequestsTableItemContextMenu'
            },
            '#addRequestBtn': {
                click: 'onAddRequestBtnClick'
            },
            "#searchField": {
                change: 'onSearchFieldChange'
            }
        }
    },

    onRequestsTableRefresh: function(grid) {
        Ext.getStore('requestsStore').reload();
    },

    onAddRequestBtnClick: function(btn) {
        Ext.create('request_wnd', {title: 'Add Request', mode: 'add'}).show();
    },

    onSearchFieldChange: function(fld, newValue) {
        var grid = Ext.getCmp('requestsTable'),
            store = grid.getStore(),
            columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column].toString().toLowerCase().indexOf(newValue.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });

        grid.setHeight(Ext.Element.getViewportHeight() - 64);
    },

    onRequestsTableItemContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [
                {
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
        Ext.create('request_wnd', {title: 'Edit Request', mode: 'edit', record: record}).show();
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

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var grid = Ext.getCmp('requestsTable');
                    grid.fireEvent('refresh', grid);
                    Ext.ux.ToastMessage('Record has been deleted!');

                    // Reload stores
                    if (Ext.getStore('librariesStore').isLoaded()) Ext.getStore('librariesStore').reload();
                    if (Ext.getStore('incomingLibrariesStore').isLoaded()) Ext.getStore('incomingLibrariesStore').reload();
                    if (Ext.getStore('PoolingTree').isLoaded()) Ext.getStore('PoolingTree').reload();
                    if (Ext.getStore('libraryPreparationStore')) Ext.getStore('libraryPreparationStore').reload();
                    if (Ext.getStore('poolingStore').isLoaded()) Ext.getStore('poolingStore').reload();

                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: delete_request/');
                    console.error(response);
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: delete_request/');
                console.error(response);
            }
        });
    }
});
