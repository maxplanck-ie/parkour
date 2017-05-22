Ext.define('MainHub.view.librarypreparation.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    requires: [
        'MainHub.view.librarypreparation.BenchtopProtocolWindow',
        'Ext.ux.FileUploadWindow'
    ],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#libraryPreparationTable': {
                // boxready: 'refresh',
                refresh: 'refresh',
                edit: 'editRecord',
                itemcontextmenu: 'showContextMenu'
            },
            '#downloadBenchtopProtocolLPBtn': {
                click: 'downloadBenchtopProtocol'
            }
        }
    },

    activateView: function() {
        Ext.getStore('libraryPreparationStore').reload();
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
            'spike_in_description', 'spike_in_volume', 'pcr_cycles',
            'concentration_library', 'mean_fragment_size', 'nM'];
        var nMFormulaDataIndices = ['concentration_library',
                                    'mean_fragment_size'];

        if (typeof dataIndex !== 'undefined' && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('libraryProtocol') === record.get('libraryProtocol') && item !== record) {
                    item.set(dataIndex, record.get(dataIndex));

                    // Calculate nM
                    if (nMFormulaDataIndices.indexOf(dataIndex) !== -1) {
                        var concentrationLibrary = item.get('concentration_library');
                        var meanFragmentSize = item.get('mean_fragment_size');
                        if (concentrationLibrary && meanFragmentSize) {
                            var nM = ((concentrationLibrary / (meanFragmentSize * 650)) * 1000000).toFixed(2);;
                            item.set('nM', nM);
                        }
                    }
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
        var record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            concentrationSample = values.concentration_sample,
            startingAmount = values.starting_amount,
            startingVolume = values.starting_volume,
            spikeInVolume = values.spike_in_volume,
            concentrationLibrary = values.concentration_library,
            meanFragmentSize = values.mean_fragment_size,
            nM = values.nM,
            url = 'library_preparation/update/';

        var params = $.extend({
            sample_id: record.get('sampleId'),
            qc_result: values.qc_result !== null ? values.qc_result : ''
        }, values);

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
                    Ext.getStore('libraryPreparationStore').reload();
                    // if (Ext.getStore('poolingStore').isLoaded()) Ext.getStore('poolingStore').reload();
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

    downloadBenchtopProtocol: function(btn) {
        var store = Ext.getStore('libraryPreparationStore'),
            samples = [];

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('selected')) {
                samples.push(record.get('sampleId'));
            }
        });

        if (samples.length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'library_preparation/download_benchtop_protocol/',
                target: '_blank',
                params: {
                    'samples': Ext.JSON.encode(samples)
                }
            });

            // Ext.create('MainHub.view.librarypreparation.BenchtopProtocolWindow', {
            //     samples: samples
            // }).show();
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
            }]
        }).showAt(e.getXY());
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
