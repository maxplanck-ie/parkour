Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#poolingTable': {
                // boxready: 'refresh',
                refresh: 'refresh',
                beforeEdit: 'toggleEditors',
                edit: 'editRecord'
            },
            '#checkColumn': {
                beforecheckchange: 'selectRecord'
            },
            '#downloadBenchtopProtocolPBtn': {
                click: 'downloadBenchtopProtocol'
            },
            '#downloadPoolingTemplateBtn': {
                click: 'downloadPoolingTemplate'
            }
        }
    },

    activateView: function() {
        Ext.getStore('poolingStore').reload();
    },

    refresh: function() {
        Ext.getStore('poolingStore').load(function(records, operation, success) {
            if (success && records.length > 0) {
                Ext.getCmp('downloadBenchtopProtocolPBtn').setDisabled(false);
                Ext.getCmp('downloadPoolingTemplateBtn').setDisabled(false);
            }
        });
    },

    toggleEditors: function(editor, context) {
        var record = context.record;
        if (record.get('sampleId') !== 0 && (
            record.get('status') === 2 || record.get('status') === -2)) {
            return false
        }
    },

    editRecord: function(editor, context) {
        var grid = context.grid,
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            concentrationC1 = values.concentration_c1,
            url = 'pooling/edit/';

        var params = $.extend({
            library_id: record.get('libraryId'),
            sample_id: record.get('sampleId'),
            qc_result: values.qc_result !== null ? values.qc_result : ''
        }, values);

        // Set Library Concentration C1
        if (values.concentration > 0 && values.mean_fragment_size > 0 &&
            Object.keys(changes).indexOf('concentration_c1') === -1) {
            concentrationC1 = ((values.concentration / (values.mean_fragment_size * 650)) * Math.pow(10, 6)).toFixed(1);
            params['concentration_c1'] = concentrationC1;
        }

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: params,

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    grid.fireEvent('refresh', grid);

                    // Reload stores
                    // if (Ext.getStore('librariesStore').isLoaded()) Ext.getStore('librariesStore').reload();
                    // if (Ext.getStore('incomingLibrariesStore').isLoaded()) Ext.getStore('incomingLibrariesStore').reload();
                    // MainHub.Utilities.reloadAllStores();
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
                console.error(response);
            }
        });
    },

    selectRecord: function(cb, rowIndex, checked, record) {
        // Don't select samples which aren't prepared yet
        if (record.get('sampleId') !== 0 && (
            record.get('status') === 2 || record.get('status') === -2)) {
            return false;
        } else {
            // Don't select records from a different pool
            var selectedRecord = Ext.getStore('poolingStore').findRecord('selected', true);
            if (selectedRecord) {
                if (record.get('poolId') !== selectedRecord.get('poolId')) {
                    Ext.ux.ToastMessage('You can select records only from the same pool.', 'warning');
                    return false;
                }
            }
        }
    },

    downloadBenchtopProtocol: function() {
        var store = Ext.getStore('poolingStore'),
            libraries = [],
            samples = [];

        // Get all checked (selected) records
        store.each(function(record) {
            if (record.get('selected')) {
                if (record.get('libraryId') === 0) {
                    samples.push(record.get('sampleId'));
                } else {
                    libraries.push(record.get('libraryId'));
                }
            }
        });

        if (libraries.length > 0 || samples.length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'pooling/download_benchtop_protocol/',
                target: '_blank',
                params: {
                    samples: Ext.JSON.encode(samples),
                    libraries: Ext.JSON.encode(libraries)
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any libraries.', 'warning');
        }
    },

    downloadPoolingTemplate: function() {
        var store = Ext.getStore('poolingStore'),
            libraries = [],
            samples = [];

        // Get all checked (selected) records
        store.each(function(record) {
            if (record.get('selected')) {
                if (record.get('libraryId') === 0) {
                    samples.push(record.get('sampleId'));
                } else {
                    libraries.push(record.get('libraryId'));
                }
            }
        });

        if (libraries.length > 0 || samples.length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'pooling/download_pooling_template/',
                target: '_blank',
                params: {
                    samples: Ext.JSON.encode(samples),
                    libraries: Ext.JSON.encode(libraries)
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any libraries.', 'warning');
        }
    },

    uploadPoolingTemplate: function(poolName) {
        Ext.create('Ext.ux.FileUploadWindow', {
            onFileUpload: function() {
                var me = this,
                    form = this.down('form').getForm(),
                    url = 'pooling/upload_pooling_template/';

                if (form.isValid()) {
                    form.submit({
                        url: url,
                        method: 'POST',
                        waitMsg: 'Uploading...',
                        params: {
                            pool_name: poolName
                        },

                        success: function(f, action) {
                            Ext.getStore('poolingStore').reload();
                            me.close();
                            Ext.ux.ToastMessage('File has been successfully uploaded.');
                        },

                        failure: function(f, action) {
                            console.error('[ERROR]: ' + url);
                            console.error(action.response);
                        }
                    });
                } else {
                    Ext.ux.ToastMessage('You did not select any file.', 'warning');
                }
            }
        });
    }
});
