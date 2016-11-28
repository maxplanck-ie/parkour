Ext.define('MainHub.view.pooling.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#libraryPreparationTable': {
                boxready: 'onLibraryPreparationTableBoxready',
                refresh: 'onLibraryPreparationTableRefresh',
                edit: 'onLibraryPreparationTableEdit',
                itemcontextmenu: 'onLibraryPreparationTableContextMenu'
            },
            '#downloadBenchtopProtocolLPBtn': {
                click: 'downloadBenchtopProtocolLPBtnClick'
            }
        }
    },

    onLibraryPreparationTableBoxready: function() {
        Ext.getStore('libraryPreparationStore').load(function(records, operation, success) {
            if (success && records.length > 0) {
                Ext.getCmp('downloadBenchtopProtocolLPBtn').setDisabled(false);
            }
        });
    },

    onLibraryPreparationTableRefresh: function(grid) {
        // Reload the store
        // grid.getStore().removeAll();
        // grid.getStore().reload();
        Ext.getStore('libraryPreparationStore').reload();
    },

    onLibraryPreparationTableEdit: function(editor, context) {
        var grid = context.grid,
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            concentrationSample = values.concentrationSample,
            startingAmount = values.startingAmount,
            startingVolume = values.startingVolume,
            spikeInVolume = values.spikeInVolume,
            ulSample = values.ulSample,
            ulBuffer = values.ulBuffer,
            concentrationLibrary = values.concentrationLibrary,
            meanFragmentSize = values.meanFragmentSize,
            nM = values.nM,
            url = 'edit_library_preparation/';

        // Set µl Sample
        if (concentrationSample > 0 && startingAmount > 0 &&
            Object.keys(changes).indexOf('ulSample') == -1) {
                ulSample = (startingAmount / concentrationSample).toFixed(1);
                // record.set('ulSample', ulSample);
        }

        // Set µl Buffer
        if (startingVolume > 0 && ulSample > 0 && spikeInVolume > 0  &&
            startingVolume > (parseFloat(ulSample) + parseFloat(spikeInVolume)) &&
            Object.keys(changes).indexOf('ulBuffer') == -1) {
                ulBuffer = (startingVolume - ulSample - spikeInVolume).toFixed(1);
                // record.set('ulBuffer', ulBuffer);
        }

        // Set nM
        if (concentrationLibrary > 0 && meanFragmentSize > 0 &&
            Object.keys(changes).indexOf('nM') == -1) {
                nM = ((concentrationLibrary / (meanFragmentSize * 650)) * 1000000).toFixed(2);
                // record.set('nM', nM);
        }

        // record.commit();0
        // grid.getStore().commitChanges();

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                sample_id:              record.get('sampleId'),
                starting_amount:        startingAmount,
                starting_volume:        startingVolume,
                spike_in_description:   values.spikeInDescription,
                spike_in_volume:        spikeInVolume,
                ul_sample:              ulSample,
                ul_buffer:              ulBuffer,
                pcr_cycles:             values.pcrCycles,
                concentration_library:  concentrationLibrary,
                mean_fragment_size:     meanFragmentSize,
                nM:                     nM
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    grid.fireEvent('refresh', grid);
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url + ': ' + obj.error);
                }
            },

            failure: function (response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
            }
        });
    },

    downloadBenchtopProtocolLPBtnClick: function(btn) {
        var store = Ext.getStore('libraryPreparationStore'),
            samples = [];

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('active')) {
                samples.push(record.get('sampleId'));
            }
        });

        if (samples.length > 0) {
            Ext.create('MainHub.view.pooling.BenchtopProtocolWindow', {
                samples: samples
            }).show();
        } else {
            Ext.ux.ToastMessage('You did not select any samples.', 'warning');
        }
    },

    onLibraryPreparationTableContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Upload File',
                iconCls: 'x-fa fa-upload',
                handler: function() {
                    me.uploadFile(record);
                }
            }]
        }).showAt(e.getXY());
    },

    uploadFile: function(record) {
        Ext.create('Ext.ux.FileUploadWindow', {
            onFileUpload: function() {
                var me = this,
                    form = this.down('form').getForm(),
                    url = 'upload_library_preparation_file/';

                if (form.isValid()) {
                    form.submit({
                        url: url,
                        method: 'POST',
                        waitMsg: 'Uploading...',
                        params: {
                            library_protocol: record.get('libraryProtocol')
                        },

                        success: function(f, action) {
                            var obj = Ext.JSON.decode(action.response.responseText);

                            if (obj.success) {
                                Ext.getStore('libraryPreparationStore').reload();
                                me.close();
                                Ext.ux.ToastMessage('File has been successfully uploaded.', 'info');
                            } else {
                                Ext.ux.ToastMessage('There is a problem with the provided file.', 'error');
                            }
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