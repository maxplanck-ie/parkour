Ext.define('MainHub.view.requests.RequestWindowController', {
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
            records = Ext.getCmp('librariesInRequestTable').getStore().data.items;

        if (form.isValid() && records.length > 0) {
            var data = form.getForm().getFieldValues();

            var libraries = records.filter(function(item) {
                return item.get('recordType') === 'L';
            });

            var samples = records.filter(function(item) {
                return item.get('recordType') === 'S';
            });

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
                    'libraries': Ext.JSON.encode(Ext.Array.pluck(Ext.Array.pluck(libraries, 'data'), 'libraryId')),
                    'samples': Ext.JSON.encode(Ext.Array.pluck(Ext.Array.pluck(samples, 'data'), 'sampleId'))
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        var requestsGrid = Ext.getCmp('requestsTable'),
                            librariesGrid = Ext.getCmp('librariesTable');
                        requestsGrid.fireEvent('refresh', requestsGrid);
                        if (typeof librariesGrid != 'undefined') {
                            librariesGrid.fireEvent('refresh', librariesGrid);
                        }
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
        } else if (records.length === 0) {
            Ext.ux.ToastMessage('You did not add any Libraries/Samples', 'warning');
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
                        var requestsGrid = Ext.getCmp('requestsTable'),
                            librariesGrid = Ext.getCmp('librariesTable');
                        requestsGrid.fireEvent('refresh', requestsGrid);
                        if (typeof librariesGrid != 'undefined') {
                            librariesGrid.fireEvent('refresh', librariesGrid);
                        }
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
