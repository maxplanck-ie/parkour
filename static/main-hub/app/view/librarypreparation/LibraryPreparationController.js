Ext.define('MainHub.view.librarypreparation.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#libraryPreparationTable': {
                refresh: 'refresh',
                edit: 'editRecord',
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu'
            },
            '#downloadBenchtopProtocolLPBtn': {
                click: 'downloadBenchtopProtocol'
            },
            '#searchField': {
                change: 'search'
            },
            '#cancelBtn': {
                click: 'cancel'
            },
            '#saveBtn': {
                click: 'save'
            }
        }
    },

    activateView: function() {
        Ext.getStore('libraryPreparationStore').reload();
    },

    refresh: function(grid) {
        // Ext.getStore('libraryPreparationStore').load(function(records, operation, success) {
        //     if (success && records.length > 0) {
        //         Ext.getCmp('downloadBenchtopProtocolLPBtn').setDisabled(false);
        //     }
        // });
        Ext.getStore('libraryPreparationStore').reload();
    },

    applyToAll: function(record, dataIndex) {
        var store = Ext.getStore('libraryPreparationStore');
        var allowedColumns = ['starting_amount', 'starting_volume',
            'spike_in_description', 'spike_in_volume', 'pcr_cycles',
            'concentration_library', 'mean_fragment_size', 'nM',
            'concentration_sample', 'comments_facility', 'comments'];
        var nMFormulaDataIndices = ['concentration_library', 'mean_fragment_size'];

        if (typeof dataIndex !== undefined && allowedColumns.indexOf(dataIndex) !== -1) {
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
                    console.error(error);
                    setTimeout(function() {
                        Ext.ux.ToastMessage(error.statusText, 'error');
                    }, 100);
                }
            });
        }
    },

    editRecord: function(editor, context) {
        var record = context.record;
        var changes = record.getChanges();
        var values = context.newValues;
        // var concentrationSample = values.concentration_sample;
        // var startingAmount = values.starting_amount;
        // var startingVolume = values.starting_volume;
        // var spikeInVolume = values.spike_in_volume;
        var concentrationLibrary = values.concentration_library;
        var meanFragmentSize = values.mean_fragment_size;
        var nM = values.nM;

        var params = $.extend({
            sample_id: record.get('sampleId'),
            qc_result: values.qc_result !== null ? values.qc_result : ''
        }, values);

        // Set nM
        if (concentrationLibrary > 0 && meanFragmentSize > 0 &&
            Object.keys(changes).indexOf('nM') === -1) {
            nM = ((concentrationLibrary / (meanFragmentSize * 650)) * 1000000).toFixed(2);
            params.nM = nM;
        }

        Ext.Ajax.request({
            url: 'library_preparation/update/',
            method: 'POST',
            scope: this,
            params: params,
            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    Ext.getStore('libraryPreparationStore').reload();
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

    showGroupContextMenu: function(view, node, libraryProtocolId, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Select All',
                iconCls: 'x-fa fa-check-square-o',
                handler: function() {
                    me.selectUnselectAll(parseInt(libraryProtocolId), true);
                }
            },
            {
                text: 'Unselect All',
                iconCls: 'x-fa fa-square-o',
                handler: function() {
                    me.selectUnselectAll(parseInt(libraryProtocolId), false);
                }
            },
            '-',
            {
                text: 'QC: All selected passed',
                iconCls: 'x-fa fa-check',
                handler: function() {
                    me.qualityCheckAll(parseInt(libraryProtocolId), true);
                }
            },
            {
                text: 'QC: All selected failed',
                iconCls: 'x-fa fa-times',
                handler: function() {
                    me.qualityCheckAll(parseInt(libraryProtocolId), false);
                }
            }]
        }).showAt(e.getXY());
    },

    selectUnselectAll: function(libraryProtocolId, selected) {
        var store = Ext.getStore('libraryPreparationStore');

        store.each(function(item) {
            if (item.get('libraryProtocol') === libraryProtocolId) {
                item.set('selected', selected);
            }
        });
    },

    qualityCheckAll: function(libraryProtocolId, result) {
        var store = Ext.getStore('libraryPreparationStore');
        var samples = [];

        store.each(function(item) {
            if (item.get('libraryProtocol') === libraryProtocolId && item.get('selected')) {
                samples.push(item.get('sampleId'));
            }
        });

        if (samples.length !== 0) {
            Ext.Ajax.request({
                url: 'library_preparation/qc_update_all/',
                method: 'POST',
                scope: this,
                params: {
                    samples: Ext.JSON.encode(samples),
                    result: result
                },
                success: function(response) {
                    var obj = Ext.JSON.decode(response.responseText);
                    if (obj.success) {
                        Ext.getStore('libraryPreparationStore').reload();
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                    }
                },
                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error(response);
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any samples.', 'warning');
        }
    },

    downloadBenchtopProtocol: function(btn) {
        var store = Ext.getStore('libraryPreparationStore');
        var samples = [];

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
                    var dataIndex = MainHub.Utilities.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            }]
        }).showAt(e.getXY());
    },

    cancel: function() {
        Ext.getStore('libraryPreparationStore').rejectChanges();
    },

    save: function() {
        MainHub.Store.save('libraryPreparationStore');
    },

    search: function(fld, query) {
        var grid = Ext.getCmp('libraryPreparationTable');
        var store = grid.getStore();
        var columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column] && record.data[column].toString().toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });
    }
});
