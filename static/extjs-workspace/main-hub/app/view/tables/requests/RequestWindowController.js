Ext.define('MainHub.view.tables.requests.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.request_wnd',

    config: {
        control: {
            '#': {
                boxready: 'onRequestWindowBoxready'
            },
            '#searchField': {
                change: 'onSearchFieldChange'
            },
            '#addRequestWndBtn': {
                // click: 'onAddRequestWndBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onRequestWindowBoxready: function(wnd) {
        var grid = Ext.getCmp('researchersInAddRequestTable');

        if (wnd.mode == 'add') {
            Ext.getCmp('addRequestWndBtn').show();
        } else {
            var record = wnd.record.data;
            Ext.getCmp('editRequestWndBtn').show();
        }

        // Get researchers table
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

                    if (wnd.mode == 'add') {
                        wnd.setLoading(false);
                    } else {
                        var rec = grid.getStore().findRecord('researcherId', record.researcherId),
                            rowIndex = grid.getStore().indexOf(rec);

                         // Select researcher on request edit
                        grid.getSelectionModel().select(rowIndex);
                        grid.getView().getNode(rowIndex).scrollIntoView();
                    }
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

        // Set form fields with request data
        if (wnd.mode == 'edit') {
            var form = Ext.getCmp('requestForm').getForm();

            form.setValues({
                status: record.status,
                name: record.name,
                projectType: record.projectType,
                description: record.description,
                termsOfUseAccept: record.termsOfUseAccept
            });

            wnd.setLoading(false);
        }
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
        var form = Ext.getCmp('requestForm'),
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
        btn.up('request_wnd').close();
    }
});