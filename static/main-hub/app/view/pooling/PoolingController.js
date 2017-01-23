Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#poolingTable': {
                boxready: 'refresh',
                refresh: 'refresh',
                groupcontextmenu: 'showGroupContextMenu',
                beforeedit: 'hideFloatingButtons',
                edit: 'editRecord'
            },
            '#downloadBenchtopProtocolPBtn': {
                // click: ''
            },
            '#downloadPoolingTemplateBtn': {
                click: 'downloadPoolingTemplate'
            }
        }
    },

    refresh: function() {
        Ext.getStore('poolingStore').load(function(records, operation, success) {
            if (success && records.length > 0) {
                Ext.getCmp('downloadBenchtopProtocolPBtn').setDisabled(false);
                Ext.getCmp('downloadPoolingTemplateBtn').setDisabled(false);
            }
        });
    },

    showGroupContextMenu: function(view, node, group, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Upload Template QC Normalization and Pooling',
                iconCls: 'x-fa fa-upload',
                handler: function() {
                    me.uploadPoolingTemplate(group);
                }
            }]
        }).showAt(e.getXY());
    },

    hideFloatingButtons: function(editor) {
        // Hide Update and Cancel buttons
        editor.getEditor().floatingButtons.items.items[0].hide();
        editor.getEditor().floatingButtons.items.items[1].hide();

        setTimeout(function() {
            $('.x-grid-row-editor-buttons').hide();
        }, 100);
    },

    editRecord: function(editor, context) {
        var grid = context.grid,
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            concentration = values.concentration,
            meanFragmentSize = values.meanFragmentSize,
            concentrationC1 = values.concentrationC1,
            concentrationC2 = values.concentrationC2,
            sampleVolume = values.sampleVolume,
            bufferVolume = values.bufferVolume,
            qcResult = (values.qcResult !== null) ? values.qcResult : '',
            url = 'pooling/edit/';

        // Set Library Concentration C1
        if (concentration > 0 && meanFragmentSize > 0 &&
            Object.keys(changes).indexOf('concentrationC1') == -1) {
            concentrationC1 = ((concentration / (meanFragmentSize * 650)) * 1000000).toFixed(1);
        }

        // Set Buffer Volume V2
        if (concentrationC1 > 0 && sampleVolume > 0 && concentrationC2 > 0 &&
            (parseFloat(concentrationC1) * parseFloat(sampleVolume)) / parseFloat(concentrationC2) > parseFloat(sampleVolume) &&
            Object.keys(changes).indexOf('bufferVolume') == -1) {
            bufferVolume = ((concentrationC1 * sampleVolume) / concentrationC2 - sampleVolume).toFixed(1);
        }

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: {
                library_id: record.get('libraryId'),
                sample_id: record.get('sampleId'),
                concentration: concentration,
                concentration_c1: concentrationC1,
                concentration_c2: concentrationC2,
                sample_volume: sampleVolume,
                buffer_volume: bufferVolume,
                percentage_library: record.get('percentageLibrary'),
                volume_to_pool: record.get('volumeToPool'),
                qc_result: qcResult
            },

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    grid.fireEvent('refresh', grid);

                    // Reload stores
                    if (Ext.getStore('librariesStore').isLoaded()) Ext.getStore('librariesStore').reload();
                    if (Ext.getStore('incomingLibrariesStore').isLoaded()) Ext.getStore('incomingLibrariesStore').reload();
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

    downloadPoolingTemplate: function() {
        var store = Ext.getStore('poolingStore'),
            libraries = [],
            samples = [];

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('active')) {
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
