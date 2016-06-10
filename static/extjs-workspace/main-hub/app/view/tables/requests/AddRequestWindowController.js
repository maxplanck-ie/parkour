Ext.define('MainHub.view.tables.requests.AddRequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.add_request',

    config: {
        control: {
            '#': {
                boxready: 'onAddRequestWindowBoxready'
            },
            '#searchField': {
                change: 'onSearchFieldChange'
            },
            '#addBtn': {
                // click: 'onAddBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onAddRequestWindowBoxready: function(wnd) {
        var grid = Ext.getCmp('researchersInAddRequestTable');

        wnd.setLoading();
        Ext.Ajax.request({
            url: 'get_researchers/',
            method: 'POST',
            timeout: 1000000,
            scope: this,

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var store = Ext.create('Ext.data.Store', {
                        fields: ['firstName', 'lastName'],
                        data: obj.data
                    });

                    grid.setStore(store);
                    wnd.setLoading(false);
                } else {
                    wnd.setLoading(false);
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.log('[ERROR]: get_researchers()');
                    console.log(response);
                }
            },

            failure: function(response) {
                wnd.setLoading(false);
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.log('[ERROR]: get_researchers()');
                console.log(response);
            }
        });
    },

    onSearchFieldChange: function(fld, newValue) {
        var grid = Ext.getCmp('researchersInAddRequestTable'),
            store = grid.getStore(),
            columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column].toLowerCase().indexOf(newValue.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });
    },

    onAddBtnClick: function(btn) {
        var form = Ext.getCmp('addRequestForm'),
            wnd = btn.up('add_request');

        if (form.isValid()) {
            var data = form.getValues();

            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: 'add_request/',
                method: 'POST',
                scope: this,

                params: {
                    'first_name': data.firstName,
                    'last_name': data.lastName,
                    'telephone': data.telephone,
                    'email': data.email,
                    'pi': data.pi,
                    'organization': data.organization,
                    'cost_unit': data.costUnit
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        var grid = Ext.getCmp('requestsTable');
                        grid.fireEvent('refresh', grid);
                        Ext.ux.ToastMessage('Record has been added!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.log('[ERROR]: add_request(): ' + obj.error);
                        console.log(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.log('[ERROR]: add_request()');
                    console.log(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('add_request').close();
    }
});