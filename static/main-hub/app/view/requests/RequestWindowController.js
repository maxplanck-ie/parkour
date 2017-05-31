Ext.define('MainHub.view.requests.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests-requestwindow',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#': {
                boxready: 'onRequestWindowBoxready'
            },
            '#librariesInRequestTable': {
                loadstore: 'reloadLibrariesInRequestStore',
                refresh: 'refreshLibrariesInRequestTable',
                itemcontextmenu: 'showContextMenu'
            },
            '#downloadRequestBlankBtn': {
                click: 'generatePDF'
            },
            '#uploadSignedBlankBtn': {
                click: 'uploadPDF'
            },
            '#saveRequestWndBtn': {
                click: 'save'
            },
            '#addLibraryBtn': {
                click: 'addLibrary'
            },
            '#batchAddBtn': {
                click: 'showBatchAddWindow'
            }
        }
    },

    reloadLibrariesInRequestStore: function(grid, requestId) {
        grid.getStore().load({
            params: {
                'request_id': requestId
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Libraries/Samples', 'error');
                }
            }
        });
    },

    onRequestWindowBoxready: function(wnd) {
        Ext.getStore('requestFilesStore').removeAll();

        if (wnd.mode === 'add') {
            Ext.getStore('librariesInRequestStore').removeAll();
            Ext.getCmp('downloadRequestBlankBtn').disable();
            Ext.getCmp('uploadSignedBlankBtn').disable();
        }
        else {
            var form = Ext.getCmp('requestForm').getForm();
            var grid = Ext.getCmp('librariesInRequestTable');
            var record = wnd.record.data;

            form.setValues(record);
            Ext.getCmp('requestName').enable();

            if (record.deepSeqRequestPath !== '') {
                $('#uploaded-request-file').html('<a href="' + record.deepSeqRequestPath + '" target="_blank">uploaded</a>');
                Ext.getCmp('downloadRequestBlankBtn').disable();
                Ext.getCmp('uploadSignedBlankBtn').disable();

                // this.disableButtonsAndMenus();
            }

            // Disable Request editing
            if (!USER_IS_STAFF && record.restrictPermissions) {
                this.disableButtonsAndMenus();
            }

            // Load all Libraries/Samples for current Request
            grid.fireEvent('loadstore', grid, record.requestId);

            // Load files
            if (record.files.length > 0) {
                Ext.getStore('requestFilesStore').load({
                    params: {
                        'file_ids': Ext.JSON.encode(record.files)
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load files', 'error');
                    }
                });
            }
        }

        this.initializeTooltips();
    },

    refreshLibrariesInRequestTable: function(grid) {
        var requestId = grid.up('window').record.get('requestId');
        grid.getStore().removeAll();
        grid.fireEvent('loadstore', grid, requestId);
    },

    showContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
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
                                if (btn === 'yes') {
                                    me.deleteRecord(record);
                                }
                            }
                        });
                    }
                }
            ]
        }).showAt(e.getXY());
    },

    editRecord: function(record) {
        var store = Ext.getStore('librariesStore');
        Ext.create('MainHub.view.libraries.LibraryWindow', {
            title: record.get('recordType') === 'L' ? 'Edit Library' : 'Edit Sample',
            mode: 'edit',
            record: store.findRecord('barcode', record.get('barcode'))
        }).show();
    },

    deleteRecord: function(record) {
        var url = record.data.recordType === 'L' ? 'library/delete/' : 'sample/delete/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: {
                'record_id': record.data.recordType === 'L' ? record.data.libraryId : record.data.sampleId
            },

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    var grid = Ext.getCmp('librariesInRequestTable');
                    grid.fireEvent('refresh', grid);
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
    },

    generatePDF: function(btn) {
        var wnd = btn.up('window');
        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true
        });

        form.submit({
            url: 'request/generate_deep_sequencing_request/',
            target: '_blank',
            params: {
                'request_id': wnd.record.get('requestId')
            }
        });
    },

    uploadPDF: function(btn) {
        var me = this,
            wnd = btn.up('window'),
            requestId = wnd.record.get('requestId'),
            url = 'request/upload_deep_sequencing_request/';

        Ext.create('Ext.ux.FileUploadWindow', {
            onFileUpload: function() {
                var uploadWindow = this,
                    form = this.down('form').getForm();

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
                                Ext.ux.ToastMessage('Deep Sequencing Request has been successfully uploaded.');

                                $('#uploaded-request-file').html('<a href="' + obj.path + '" target="_blank">uploaded</a>');
                                Ext.getCmp('downloadRequestBlankBtn').disable();
                                Ext.getCmp('uploadSignedBlankBtn').disable();

                                me.disableButtonsAndMenus();

                                Ext.getStore('requestsStore').reload();
                            } else {
                                Ext.ux.ToastMessage('There is a problem with the provided file.', 'error');
                            }

                            uploadWindow.close();
                        },

                        failure: function(f, action) {
                            var errorMsg = (action.failureType == 'server') ? 'Server error.' : 'Error.';
                            Ext.ux.ToastMessage(errorMsg, 'error');
                            console.error(action);
                        }
                    });
                } else {
                    Ext.ux.ToastMessage('You did not select any file.', 'warning');
                }
            }
        });
    },

    save: function(btn) {
        var wnd = btn.up('window'),
            form = Ext.getCmp('requestForm'),
            store = Ext.getStore('librariesInRequestStore');

        if (form.isValid() && store.getCount() > 0) {
            var data = form.getForm().getFieldValues(),
                libraries = [],
                samples = [];

            store.each(function(item) {
                var libraryId = item.get('libraryId'),
                    sampleId = item.get('sampleId');

                if (sampleId === 0) {
                    libraries.push(libraryId);
                } else {
                    samples.push(sampleId);
                }
            });

            wnd.setLoading('Saving...');
            Ext.Ajax.request({
                url: 'request/save/',
                method: 'POST',
                timeout: 1000000,
                scope: this,

                params: {
                    mode: wnd.mode,
                    request_id: (typeof wnd.record !== 'undefined') ? wnd.record.get('requestId') : '',
                    description: data.description,
                    libraries: Ext.JSON.encode(libraries),
                    samples: Ext.JSON.encode(samples),
                    files: Ext.JSON.encode(form.down('filegridfield').getValue())
                },

                success: function(response) {
                    var obj = Ext.JSON.decode(response.responseText);
                    if (obj.success) {
                        Ext.getStore('requestsStore').reload();
                        // MainHub.Utilities.reloadAllStores();
                        Ext.ux.ToastMessage('Request has been saved!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error(response);
                }
            });
        } else if (store.getCount() === 0) {
            Ext.ux.ToastMessage('You did not add any Libraries/Samples', 'warning');
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    addLibrary: function(btn) {
        Ext.create('MainHub.view.libraries.LibraryWindow', {
            title: 'Add Library/Sample',
            mode: 'add'
        }).show();
    },

    initializeTooltips: function() {
        $.each($('.request-field-tooltip'), function(idx, item) {
            Ext.create('Ext.tip.ToolTip', {
                title: 'Help',
                target: item,
                html: $(item).attr('tooltip-text'),
                dismissDelay: 15000,
                maxWidth: 300
            });
        });
    },

    showBatchAddWindow: function() {
        Ext.create('MainHub.view.libraries.BatchAddWindow').show();
    },

    disableButtonsAndMenus: function() {
        if (!USER_IS_STAFF) {
            var grid = Ext.getCmp('librariesInRequestTable');

            // Don't add new records to a Request
            grid.down('#batchAddBtn').disable();
            grid.down('#addLibraryBtn').disable();
            grid.suspendEvent('itemcontextmenu');
        }
    }
});
