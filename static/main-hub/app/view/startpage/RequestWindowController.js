Ext.define('MainHub.view.startpage.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.startpage-requestwindow',

    config: {
        control: {
            '#': {
                boxready: 'onRequestWindowBoxready'
            },
            '#librariesInRequestTable': {
                loadstore: 'onLibrariesInRequestTableLoadStore',
                refresh: 'onLibrariesInRequestTableRefresh',
                itemcontextmenu: 'onLibrariesInRequestTableItemContextMenu'
            },
            '#generatePDFBtn': {
                click: 'onGeneratePDFBtnClick'
            },
            '#uploadBtn': {
                click: 'onUploadBtnClick'
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

    onLibrariesInRequestTableLoadStore: function(grid, requestId) {
        grid.getStore().load({
            params: {
                'request_id': requestId
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Libraries/Samples', 'error');
            }
        });
    },

    onRequestWindowBoxready: function(wnd) {
        if (wnd.mode == 'add') {
            Ext.getStore('librariesInRequestStore').removeAll();
            Ext.getCmp('deepSeqRequest').mask(
                'You need to save the request to proceed.',
                'deep-seq-request-mask'
            );
            Ext.getCmp('deepSeqRequest').body.update('');
        } else {
            var form = Ext.getCmp('requestForm').getForm(),
                grid = Ext.getCmp('librariesInRequestTable'),
                record = wnd.record.data;

            // Set form fields with request data
            form.setValues({
                name: record.name,
                description: record.description
            });

            Ext.getCmp('requestName').enable();
            Ext.getCmp('deepSeqRequest').enable();

            if (record.deepSeqRequestName !== '') {
                Ext.getCmp('uploadedDeepSeqRequest').setHtml(
                    'Uploaded File: <a href="' + record.deepSeqRequestPath + '" target="_blank">' + record.deepSeqRequestName + '</a>'
                );
            }

            // Load all Libraries/Samples for current Request
            grid.fireEvent('loadstore', grid, record.requestId);
        }
    },

    onLibrariesInRequestTableRefresh: function(grid) {
        var requestId = grid.up('request_wnd').record.get('requestId');

        // Reload the table
        grid.getStore().removeAll();
        grid.fireEvent('loadstore', grid, requestId);
    },

    onLibrariesInRequestTableItemContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: 'Edit',
                    iconCls: 'x-fa fa-pencil',
                    handler: function() {
                        me.editRecord(record);
                    }
                },
                {
                    text: 'Delete',
                    iconCls: 'x-fa fa-trash',
                    handler: function() {
                        Ext.Msg.show({
                            title: 'Delete record',
                            message: 'Are you sure you want to delete this record?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            fn: function(btn) {
                                if (btn == 'yes') me.deleteRecord(record);
                            }
                        });
                    }
                }
            ]
        }).showAt(e.getXY());
    },

    editRecord: function(record) {
        var store = Ext.getStore('librariesStore'),
            title = '', fullRecord = null;

        if (record.get('recordType') == 'L') {
            title = 'Edit Library';
            fullRecord = store.findRecord('libraryId', record.get('libraryId'));
        } else {
            title = 'Edit Sample';
            fullRecord = store.findRecord('sampleId', record.get('sampleId'));
        }

        Ext.create('library_wnd', {
            title: title,
            mode: 'edit',
            record: fullRecord
        }).show();
    },

    deleteRecord: function(record) {
        var url = record.data.recordType == 'L' ? 'delete_library/' : 'delete_sample/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                'record_id': record.data.recordType == 'L' ? record.data.libraryId : record.data.sampleId
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var grid = Ext.getCmp('librariesInRequestTable');
                    grid.fireEvent('refresh', grid);
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
    },

    onGeneratePDFBtnClick: function(btn) {
        var wnd = btn.up('request_wnd'),
            url = 'generate_pdf/?request_id=' + wnd.record.get('requestId');

        Ext.getCmp('generatePDFForm').submit({
            target: '_blank',
            url: url,
            params: {
                'request_id': wnd.record.get('requestId')
            }
            // success: function(f, action) {
            //     debugger;
            // },
            // failure: function() {
            //     debugger;
            // }
        });
    },

    onUploadBtnClick: function(btn) {
        var wnd = btn.up('request_wnd'),
            form = Ext.getCmp('deepSeqRequestForm'),
            requestId = wnd.record.get('requestId'),
            url = 'upload_deep_sequencing_request/';

        if (form.isValid()) {
            form.submit({
                url: url,
                method: 'POST',
                waitMsg: 'Uploading...',
                params: {
                    'request_id': requestId
                },
                success: function(f, action) {
                    var obj = Ext.JSON.decode(action.response.responseText);
                    if (obj.success) {
                        Ext.getCmp('uploadedDeepSeqRequest').setHtml(
                            'Uploaded File: <a href="' + obj.path + '" target="_blank">' + obj.name + '</a>'
                        );
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: ' + url + ' : ' + obj.error);
                        console.error(action.response);
                    }
                },
                failure: function(f, action) {
                    var errorMsg = (action.failureType == 'server') ? 'Server error.' : 'Error.';
                    Ext.ux.ToastMessage(errorMsg, 'error');
                    console.error('[ERROR]: ' + url);
                    console.error(action.response.responseText);
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
                    'description': data.description,
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
