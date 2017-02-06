Ext.define('MainHub.view.startpage.RequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.startpage-requestwindow',

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
            '#generatePDFBtn': {
                click: 'generatePDF'
            },
            '#uploadBtn': {
                click: 'uploadPDF'
            },
            '#saveRequestWndBtn': {
                click: 'saveRequest'
            },
            '#addLibraryBtn': {
                click: 'addLibrary'
            }
        }
    },

    reloadLibrariesInRequestStore: function(grid, requestId) {
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
        } else {
            var form = Ext.getCmp('requestForm').getForm(),
                grid = Ext.getCmp('librariesInRequestTable'),
                record = wnd.record.data;

            form.setValues(record);
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
            title = '',
            fullRecord = null;

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
        var url = record.data.recordType == 'L' ? 'library/delete/' : 'sample/delete/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: {
                'record_id': record.data.recordType == 'L' ? record.data.libraryId : record.data.sampleId
            },

            success: function(response) {
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

    generatePDF: function(btn) {
        var wnd = btn.up('window'),
            url = 'request/generate_deep_sequencing_request/';

        Ext.getCmp('generatePDFForm').submit({
            target: '_blank',
            url: url,
            params: {
                'request_id': wnd.record.get('requestId')
            }
        });
    },

    uploadPDF: function(btn) {
        var wnd = btn.up('window'),
            form = Ext.getCmp('deepSeqRequestForm'),
            requestId = wnd.record.get('requestId'),
            url = 'request/upload_deep_sequencing_request/';

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
                        if (Ext.getStore('librariesStore').isLoaded()) Ext.getStore('librariesStore').reload();
                        if (Ext.getStore('incomingLibrariesStore').isLoaded()) Ext.getStore('incomingLibrariesStore').reload();
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: ' + url);
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

    saveRequest: function(btn) {
        var wnd = btn.up('window'),
            form = Ext.getCmp('requestForm'),
            store = Ext.getStore('librariesInRequestStore'),
            url = 'request/save/';

        if (form.isValid() && store.getCount() > 0) {
            var data = form.getForm().getFieldValues(),
                libraries = [],
                samples = [];

            store.each(function(item) {
                if (item.get('recordType') == 'L') {
                    libraries.push(item);
                } else {
                    samples.push(item);
                }
            });

            wnd.setLoading('Saving...');
            Ext.Ajax.request({
                url: url,
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

                success: function(response) {
                    var obj = Ext.JSON.decode(response.responseText);
                    if (obj.success) {
                        // var grid = Ext.getCmp('requestsTable');
                        // grid.fireEvent('refresh', grid);
                        MainHub.Utilities.reloadAllStores();
                        Ext.ux.ToastMessage('Request has been saved!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: ' + url);
                        console.error(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: ' + url);
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
    }
});
