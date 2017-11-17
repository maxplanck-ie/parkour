Ext.define('MainHub.view.requests.RequestsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests',

    mixins: ['MainHub.grid.ResizeMixin'],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#requests-grid': {
                resize: 'resize',
                boxready: 'boxready',
                itemcontextmenu: 'showContextMenu'
            },
            '#add-request-button': {
                click: 'addRequest'
            },
            '#search-field': {
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
            Ext.getCmp('requests-grid').down('[dataIndex=user_full_name]').setVisible(false);
        }
    },

    addRequest: function(btn) {
        Ext.create('MainHub.view.requests.RequestWindow', {
            title: 'Add Request',
            mode: 'add'
        }).show();
    },

    search: function(fld, query) {
        var grid = Ext.getCmp('requests-grid');
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

    showContextMenu: function(grid, record, itemEl, index, e) {
        var me = this;

        var menuItems = [{
            text: 'Edit',
            iconCls: 'x-fa fa-pencil',
            handler: function() {
                Ext.create('MainHub.view.requests.RequestWindow', {
                    title: 'Edit',
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
                    title: 'Delete',
                    message: 'Are you sure you want to delete the request?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    fn: function(btn) {
                        if (btn === 'yes') {me.deleteRequest(record);}
                    }
                });
            }
        };

        if (!USER_IS_STAFF && !record.restrict_permissions) {
            menuItems.push(deleteRequestOption);
        } else if (USER_IS_STAFF) {
            menuItems.push(deleteRequestOption);
            menuItems.push('-');
            menuItems.push({
                text: 'Compose Email',
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
        Ext.create('Ext.menu.Menu', { items: menuItems }).showAt(e.getXY());
    },

    deleteRequest: function(record) {
        Ext.Ajax.request({
            url: Ext.String.format('api/requests/{0}/', record.get('pk')),
            method: 'DELETE',
            scope: this,

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    Ext.getStore('requestsStore').reload();
                    new Noty({ text: 'Request has been deleted!' }).show();
                } else {
                    new Noty({ text: obj.message, type: 'error' }).show();
                }
            },

            failure: function(response) {
                new Noty({ text: response.statusText, type: 'error' }).show();
                console.error(response);
            }
        });
    }
});
