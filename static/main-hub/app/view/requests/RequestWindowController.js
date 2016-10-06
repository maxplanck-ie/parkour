Ext.define('MainHub.view.requests.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests-requestwindow',

    config: {
        control: {
            '#': {
                boxready: 'onRequestWindowBoxready'
            },
            '#saveRequestWndBtn': {
                click: 'onSaveRequestWndBtnClick'
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
            Ext.getStore('librariesInRequestStore').removeAll();
        }

        // Set form fields with request data
        if (wnd.mode == 'edit') {
            var form = Ext.getCmp('requestForm').getForm(),
                record = wnd.record.data;

            form.setValues({
                name: record.name,
                description: record.description
            });

            Ext.getCmp('requestName').enable();

            Ext.getStore('librariesInRequestStore').load({
                params: {
                    'request_id': record.requestId
                },
                callback: function(records, operation, success) {
                    if (!success) Ext.ux.ToastMessage('Cannot load Libraries/Samples', 'error');
                }
            });
        }
    },

    onSaveRequestWndBtnClick: function(btn) {
        var wnd = btn.up('request_wnd'),
            form = Ext.getCmp('requestForm'),
            records = Ext.getCmp('librariesInRequestTable').getStore().data.items;

        if (form.isValid() && records.length > 0) {
            var data = form.getForm().getFieldValues();

            var libraries = records.filter(function(item) {
                return item.get('recordType') === 'L';
            });

            var samples = records.filter(function(item) {
                return item.get('recordType') === 'S';
            });

            wnd.setLoading('Saving...');
            Ext.Ajax.request({
                url: 'save_request/',
                method: 'POST',
                timeout: 1000000,
                scope: this,

                params: {
                    'mode': wnd.mode,
                    'request_id': (typeof wnd.record != 'undefined') ? wnd.record.get('requestId') : '',
                    'name': data.name,
                    'description': data.description,
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
                        Ext.ux.ToastMessage('Request has been saved!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: save_request/: ' + obj.error);
                        console.error(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: save_request/');
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

    onAddLibraryBtnClick: function(btn) {
        Ext.create('library_wnd', {title: 'Add Library/Sample', mode: 'add'}).show();
    },

    onCancelBtnClick: function(btn) {
        btn.up('request_wnd').close();
    }
});
