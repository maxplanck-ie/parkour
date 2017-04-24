Ext.define('MainHub.view.librarypreparation.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    requires: [
        'MainHub.view.librarypreparation.BenchtopProtocolWindow',
        'Ext.ux.FileUploadWindow'
    ],

    config: {
        control: {
            '#libraryPreparationTable': {
                boxready: 'refresh',
                refresh: 'refresh',
                edit: 'editRecord',
                itemcontextmenu: 'showContextMenu'
            },
            '#downloadBenchtopProtocolLPBtn': {
                click: 'downloadBenchtopProtocolLP'
            }
        }
    },

    refresh: function(grid) {
        Ext.getStore('libraryPreparationStore').load(function(records, operation, success) {
            if (success && records.length > 0) {
                Ext.getCmp('downloadBenchtopProtocolLPBtn').setDisabled(false);
            }
        });
    },

    applyToAll: function(record, dataIndex) {
        var store = Ext.getStore('libraryPreparationStore');

        var allowedColumns = ['starting_amount', 'starting_volume',
            'spike_in_description', 'spike_in_volume', 'ul_sample',
            'ul_buffer', 'pcr_cycles', 'concentration_library',
            'mean_fragment_size', 'nM'
        ];

        if (typeof dataIndex !== 'undefined' && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('libraryProtocol') === record.get('libraryProtocol') && item !== record) {
                    item.set(dataIndex, record.get(dataIndex));
                }
            });
            store.sync({
                failure: function(batch, options) {
                    var error = batch.operations[0].getError();
                    setTimeout(function() {
                        Ext.ux.ToastMessage(error, 'error');
                    }, 100);
                }
            });
        }
    },

    editRecord: function(editor, context) {
        var grid = context.grid,
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            concentrationSample = values.concentration_sample,
            startingAmount = values.starting_amount,
            startingVolume = values.starting_volume,
            spikeInVolume = values.spike_in_volume,
            ulSample = values.ul_sample,
            ulBuffer = values.ul_buffer,
            concentrationLibrary = values.concentration_library,
            meanFragmentSize = values.mean_fragment_size,
            nM = values.nM,
            url = 'library_preparation/update/';

        var params = $.extend({
            sample_id: record.get('sampleId'),
            qc_result: values.qc_result !== null ? values.qc_result : ''
        }, values);

        // Set µl Sample
        if (concentrationSample > 0 && startingAmount > 0 &&
            Object.keys(changes).indexOf('ulSample') === -1) {
            ulSample = (startingAmount / concentrationSample).toFixed(2);
            params['ul_sample'] = ulSample;
        }

        // Set µl Buffer
        if (startingVolume > 0 && ulSample > 0 && spikeInVolume > 0 &&
            startingVolume > (parseFloat(ulSample) + parseFloat(spikeInVolume)) &&
            Object.keys(changes).indexOf('ulBuffer') === -1) {
            ulBuffer = (startingVolume - ulSample - spikeInVolume).toFixed(2);
            params['ul_buffer'] = ulBuffer;
        }

        // Set nM
        if (concentrationLibrary > 0 && meanFragmentSize > 0 &&
            Object.keys(changes).indexOf('nM') === -1) {
            nM = ((concentrationLibrary / (meanFragmentSize * 650)) * 1000000).toFixed(2);
            params['nM'] = nM;
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
                    if (Ext.getStore('poolingStore').isLoaded()) Ext.getStore('poolingStore').reload();
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

    downloadBenchtopProtocolLP: function(btn) {
        var store = Ext.getStore('libraryPreparationStore'),
            samples = [];

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('active')) {
                samples.push(record.get('sampleId'));
            }
        });

        if (samples.length > 0) {
            Ext.create('MainHub.view.librarypreparation.BenchtopProtocolWindow', {
                samples: samples
            }).show();
        } else {
            Ext.ux.ToastMessage('You did not select any samples.', 'warning');
        }
    },

    showContextMenu: function(gridView, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Apply to All',
                iconCls: 'x-fa fa-check-circle',
                handler: function() {
                    var dataIndex = me.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            },{
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
                    url = 'library_preparation/upload_benchtop_protocol/';

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
                                Ext.ux.ToastMessage('File has been successfully uploaded.');
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
    },

    getDataIndex: function(e, view) {
        var xPos = e.getXY()[0],
            columns = view.getGridColumns(),
            dataIndex;

        for (var column in columns) {
            var leftEdge = columns[column].getPosition()[0],
                rightEdge = columns[column].getSize().width + leftEdge;

            if (xPos >= leftEdge && xPos <= rightEdge) {
                dataIndex = columns[column].dataIndex;
                break;
            }
        }

        return dataIndex;
    }
});
