Ext.define('MainHub.view.requests.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.requests-requestwindow',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#': {
                boxready: 'onRequestWindowBoxready'
            },
            '#libraries-in-request-grid': {
                refresh: 'refreshLibrariesInRequestGrid',
                itemcontextmenu: 'showContextMenu'
            },
            '#download-request-blank-button': {
                click: 'generatePDF'
            },
            '#upload-signed-request-button': {
                click: 'uploadPDF'
            },
            '#save-button': {
                click: 'save'
            },
            // '#add-library-button': {
            //     click: 'addLibrary'
            // },
            '#batch-add-button': {
                click: 'showBatchAddWindow'
            }
        }
    },

    refreshLibrariesInRequestGrid: function(grid) {
        var requestId = grid.up('window').record.get('pk');
        grid.getStore().reload({
            url: Ext.String.format('api/requests/{0}/get_records/', requestId)
        });
    },

    onRequestWindowBoxready: function(wnd) {
        var downloadRequestBlankBtn = wnd.down('#download-request-blank-button');
        var uploadSignedRequestBtn = wnd.down('#upload-signed-request-button');

        Ext.getStore('requestFilesStore').removeAll();

        if (wnd.mode === 'add') {
            Ext.getStore('librariesInRequestStore').removeAll();
            downloadRequestBlankBtn.disable();
            uploadSignedRequestBtn.disable();
        } else {
            var form = Ext.getCmp('request-form').getForm();
            var grid = Ext.getCmp('libraries-in-request-grid');;
            var request = wnd.record.data;

            form.setValues(request);
            Ext.getCmp('requestName').enable();

            if (request.deep_seq_request_path !== '') {
                $('#uploaded-request-file').html(
                    Ext.String.format(
                        '<a href="{0}" target="_blank">uploaded</a>',
                        request.deep_seq_request_path
                    )
                )
                downloadRequestBlankBtn.disable();
                uploadSignedRequestBtn.disable();

                // this.disableButtonsAndMenus();
            }

            // Disable Request editing
            if (!USER_IS_STAFF && request.restrictPermissions) {
                this.disableButtonsAndMenus();
            }

            // Load all Libraries/Samples for current Request
            grid.fireEvent('refresh', grid);

            // Load files
            if (request.files.length > 0) {
                Ext.getStore('requestFilesStore').load({
                    url: Ext.String.format('api/requests/{0}/get_files/', request.pk),
                    params: {
                        file_ids: Ext.JSON.encode(request.files)
                    }
                });
            }
        }

        this.initializeTooltips();
    },

    showContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [
                // {
                //     text: 'Edit',
                //     iconCls: 'x-fa fa-pencil',
                //     handler: function() {
                //         me.editRecord(record);
                //     }
                // },
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

    // editRecord: function(record) {
    //     var store = Ext.getStore('librariesStore');
    //     Ext.create('MainHub.view.libraries.LibraryWindow', {
    //         title: record.get('record_type') === 'Library' ? 'Edit Library' : 'Edit Sample',
    //         mode: 'edit',
    //         record: store.findRecord('barcode', record.get('barcode'))
    //     }).show();
    // },

    deleteRecord: function(record) {
        var url = record.get('record_type') === 'Library' ? 'api/libraries/{0}/' : 'api/samples/{0}/';

        Ext.Ajax.request({
            url: Ext.String.format(url, record.get('pk')),
            method: 'DELETE',
            scope: this,

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    var grid = Ext.getCmp('libraries-in-request-grid');
                    grid.fireEvent('refresh', grid);
                    new Noty({ text: 'Record has been deleted!' }).show();
                } else {
                    new Noty({ text: obj.message, type: 'error' }).show();
                }
            },

            failure: function(response) {
                new Noty({ text: response.statusText, type: 'error' }).show();
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
                request_id: wnd.record.get('pk')
            }
        });
    },

    uploadPDF: function(btn) {
        var me = this;
        var wnd = btn.up('window');
        var url = 'request/upload_deep_sequencing_request/';
        var downloadRequestBlankBtn = wnd.down('#download-request-blank-button');
        var uploadSignedRequestBtn = wnd.down('#upload-signed-request-button');

        Ext.create('Ext.ux.FileUploadWindow', {
            onFileUpload: function() {
                var uploadWindow = this;
                var form = this.down('form').getForm();

                if (!form.isValid()) {
                    new Noty({
                        text: 'You did not select any file.',
                        type: 'warning'
                    }).show();
                    return;
                }

                form.submit({
                    url: url,
                    method: 'POST',
                    waitMsg: 'Uploading...',
                    params: {
                        'request_id': wnd.record.get('pk')
                    },

                    success: function(f, action) {
                        var obj = Ext.JSON.decode(action.response.responseText);

                        if (obj.success) {
                            new Noty({
                                text: 'Deep Sequencing Request has been successfully uploaded.'
                            }).show();

                            $('#uploaded-request-file').html(
                                Ext.String.format('<a href="{0}" target="_blank">uploaded</a>', obj.path)
                            );

                            downloadRequestBlankBtn.disable();
                            uploadSignedRequestBtn.disable();

                            me.disableButtonsAndMenus();

                            Ext.getStore('requestsStore').reload();
                        } else {
                            new Noty({
                                text: 'There was a problem with the provided file.',
                                type: 'error'
                            }).show();
                        }

                        uploadWindow.close();
                    },

                    failure: function(f, action) {
                        var errorMsg = (action.failureType === 'server') ? 'Server error.' : 'Error.';
                        new Noty({ text: errorMsg, type: 'error' }).show();
                        console.error(action);
                    }
                });
            }
        });
    },

    save: function(btn) {
        var wnd = btn.up('window');
        var form = Ext.getCmp('request-form');
        var store = Ext.getStore('librariesInRequestStore');
        var url = wnd.mode === 'add' ? 'api/requests/' : 'api/requests/{0}/edit/';

        if (store.getCount() === 0) {
            new Noty({
                text: 'No libraries/samples are added to the request.',
                type: 'warning'
            }).show();
            return;
        }

        if (!form.isValid()) {
            new Noty({ text: 'Check the form', type: 'warning' }).show();
            return;
        }

        var data = form.getForm().getFieldValues();

        wnd.setLoading('Saving...');
        Ext.Ajax.request({
            url: Ext.String.format(url, wnd.record.get('pk')),
            method: 'POST',
            scope: this,

            params: {
                data: Ext.JSON.encode({
                    description: data.description,
                    records: Ext.Array.pluck(store.data.items, 'data'),
                    files: form.down('filegridfield').getValue()
                })
            },

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    var message;
                    if (wnd.mode === 'add') {
                        message = 'Request has been saved.';
                    } else {
                        message = 'The changes have been saved.';
                    }
                    new Noty({ text: message}).show();
                    Ext.getStore('requestsStore').reload();
                } else {
                    new Noty({ text: obj.message, type: 'error' }).show();
                    console.error(response);
                }
                wnd.close();
            },

            failure: function(response) {
                wnd.setLoading(false);
                new Noty({ text: response.statusText, type: 'error' }).show();
                console.error(response);
            }
        });
    },

    // addLibrary: function(btn) {
    //     Ext.create('MainHub.view.libraries.LibraryWindow', {
    //         title: 'Add Library/Sample',
    //         mode: 'add'
    //     }).show();
    // },

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
            var grid = Ext.getCmp('libraries-in-request-grid');

            // Don't add new records to a Request
            grid.down('#batch-add-button').disable();
            grid.down('#add-library-button').disable();
            grid.suspendEvent('itemcontextmenu');
        }
    }
});
