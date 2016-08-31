Ext.define('MainHub.view.tables.requests.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.request_wnd',

    config: {
        control: {
            '#': {
                boxready: 'onRequestWindowBoxready'
            },
            '#addRequestWndBtn': {
                click: 'onAddRequestWndBtnClick'
            },
            '#editRequestWndBtn': {
                click: 'onEditRequestWndBtnClick'
            },
            '#addLibraryBtn': {
                click: 'onAddLibraryBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onRequestWindowBoxready: function(wnd) {
        var grid = Ext.getCmp('researchersInRequestWindow');

        if (wnd.mode == 'add') {
            Ext.getCmp('addRequestWndBtn').show();
            Ext.getStore('librariesInRequestStore').removeAll();
        } else {
            Ext.getCmp('editRequestWndBtn').show();
        }

        // Set form fields with request data
        if (wnd.mode == 'edit') {
            var form = Ext.getCmp('requestForm').getForm(),
                record = wnd.record.data;

            form.setValues({
                status: record.status,
                name: record.name,
                projectType: record.projectType,
                description: record.description,
                termsOfUseAccept: record.termsOfUseAccept
            });

            Ext.getStore('librariesInRequestStore').load({
                    params: {
                        'request_id': record.requestId
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load Libraries/Samples', 'error');
                    }
                });

            wnd.setLoading(false);
        }
    },

    onAddRequestWndBtnClick: function(btn) {
        var form = Ext.getCmp('requestForm'),
            wnd = btn.up('request_wnd'),
            grid = Ext.getCmp('researchersInRequestWindow');

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: 'add_request/',
                method: 'POST',
                scope: this,

                params: {
                    'status': data.status,
                    'name': data.name,
                    'project_type': data.projectType,
                    'description': data.description,
                    'terms_of_use_accept': data.termsOfUseAccept,
                    'researcher_id': 1,     // temporarily
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        var grid = Ext.getCmp('requestsTable');
                        grid.fireEvent('refresh', grid);
                        Ext.ux.ToastMessage('Record has been added!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: add_request(): ' + obj.error);
                        console.error(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: add_request()');
                    console.error(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onEditRequestWndBtnClick: function(btn) {
        var wnd = btn.up('request_wnd'),
            form = Ext.getCmp('requestForm');

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            wnd.setLoading('Updating...');
            Ext.Ajax.request({
                url: 'edit_request/',
                method: 'POST',
                scope: this,

                params: {
                    'status': data.status,
                    'name': data.name,
                    'project_type': data.projectType,
                    'description': data.description,
                    'terms_of_use_accept': data.termsOfUseAccept,
                    'researcher_id': 1,     // temporarily
                    'request_id': wnd.record.data.requestId
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        var grid = Ext.getCmp('requestsTable');
                        grid.fireEvent('refresh', grid);
                        Ext.ux.ToastMessage('Record has been updated!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: edit_request(): ' + obj.error);
                        console.error(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: edit_request()');
                    console.error(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onAddLibraryBtnClick: function(btn) {
        Ext.create('library_wnd', {title: 'Add Library/Sample', mode: 'add'}).show();
    },

    onCancelBtnClick: function(btn) {
        btn.up('request_wnd').close();
    }
});
