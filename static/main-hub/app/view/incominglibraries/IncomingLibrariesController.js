Ext.define('MainHub.view.incominglibraries.IncomingLibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.incominglibraries-incominglibraries',

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#incomingLibraries': {
                refresh: 'refresh',
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu',
                beforeedit: 'toggleEditors',
                edit: 'editRecord'
            },
            '#showLibrariesCheckbox': {
                change: 'changeFilter'
            },
            '#showSamplesCheckbox': {
                change: 'changeFilter'
            },
            '#searchField': {
                change: 'changeFilter'
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
        Ext.getStore('incomingLibrariesStore').reload();
    },

    refresh: function() {
        Ext.getStore('incomingLibrariesStore').reload();
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

    showGroupContextMenu: function(view, node, group, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Select All',
                iconCls: 'x-fa fa-check-square-o',
                handler: function() {
                    me.selectAll(parseInt(group));
                }
            },
            '-',
            {
                text: 'QC: All selected passed',
                iconCls: 'x-fa fa-check',
                handler: function() {
                    me.qualityCheckAll(parseInt(group), true);
                }
            },
            {
                text: 'QC: All selected failed',
                iconCls: 'x-fa fa-times',
                handler: function() {
                    me.qualityCheckAll(parseInt(group), false);
                }
            }]
        }).showAt(e.getXY());
    },

    selectAll: function(requestId) {
        var store = Ext.getStore('incomingLibrariesStore');
        store.each(function(item) {
            if (item.get('requestId') === requestId) {
                item.set('selected', true);
            }
        });
    },

    toggleEditors: function(editor, context) {
        var record = context.record;
        var qPCRResultEditor = Ext.getCmp('qPCRResultEditor');
        var rnaQualityEditor = Ext.getCmp('rnaQualityIncomingEditor');
        var nucleicAcidTypesStore = Ext.getStore('nucleicAcidTypesStore');

        // Toggle qPCR Result and RNA Quality
        if (record.get('recordType') === 'L') {
            qPCRResultEditor.enable();
            rnaQualityEditor.disable();
        } else {
            qPCRResultEditor.disable();

            var nat = nucleicAcidTypesStore.findRecord('id',
                record.get('nucleic_acid_type')
            );

            if (nat !== null && nat.get('type') === 'RNA') {
                rnaQualityEditor.enable();
            } else {
                rnaQualityEditor.disable();
            }
        }
    },

    applyToAll: function(record, dataIndex) {
        var me = this;
        var store = Ext.getStore('incomingLibrariesStore');
        var allowedColumns = ['dilution_factor', 'concentration_facility',
            'concentration_method_facility', 'sample_volume_facility',
            'amount_facility', 'size_distribution_facility', 'comments_facility',
            'qpcr_result_facility', 'rna_quality_facility'
        ];
        var ngFormulaDataIndices = ['dilution_factor',
            'concentration_facility', 'sample_volume_facility'];

        if (typeof dataIndex !== 'undefined' && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('requestId') === record.get('requestId') && item !== record) {
                    item.set(dataIndex, record.get(dataIndex));

                    // Calculate Amount (facility)
                    if (ngFormulaDataIndices.indexOf(dataIndex) !== -1) {
                        var dilutionFactor = item.get('dilution_factor');
                        var concentrationFacility = item.get('concentration_facility');
                        var sampleVolumeFacility = item.get('sample_volume_facility');
                        if (dilutionFactor && concentrationFacility && sampleVolumeFacility) {
                            var amountFacility = parseFloat(dilutionFactor) *
                                parseFloat(concentrationFacility) *
                                parseFloat(sampleVolumeFacility);
                            item.set('amount_facility', amountFacility);
                        }
                    }
                }
            });

            // Send the changes to the server
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
        var record = context.record;
        var changes = record.getChanges();
        var values = context.newValues;

        var params = $.extend({
            record_type: record.getRecordType(),
            record_id: (record.getRecordType() === 'L') ? record.get('libraryId') : record.get('sampleId')
        }, values);

        // Compute Amount
        if (Object.keys(changes).indexOf('amount_facility') === -1 &&
            values.dilution_factor && values.concentration_facility &&
            values.sample_volume_facility) {
            var amountFacility = parseFloat(values.dilution_factor) *
                parseFloat(values.concentration_facility) *
                parseFloat(values.sample_volume_facility);
            params.amount_facility = amountFacility;
        }

        Ext.Ajax.request({
            url: 'quality_check/update/',
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: params,

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    Ext.getStore('incomingLibrariesStore').reload();
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

    qualityCheckAll: function(requestId, result) {
        var store = Ext.getStore('incomingLibrariesStore');
        var libraries = [];
        var samples = [];

        store.each(function(item) {
            if (item.get('requestId') === requestId && item.get('selected')) {
                if (item.get('sampleId') === 0) {
                    libraries.push(item.get('libraryId'));
                } else {
                    samples.push(item.get('sampleId'));
                }
            }
        });

        if (libraries.length !== 0 || samples.length !== 0) {
            Ext.Ajax.request({
                url: 'quality_check/qc_update_all/',
                method: 'POST',
                scope: this,
                params: {
                    libraries: Ext.JSON.encode(libraries),
                    samples: Ext.JSON.encode(samples),
                    result: result
                },
                success: function(response) {
                    var obj = Ext.JSON.decode(response.responseText);
                    if (obj.success) {
                        Ext.getStore('incomingLibrariesStore').reload();
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
            Ext.ux.ToastMessage('You did not select any libraries/samples.', 'warning');
        }
    },

    cancel: function() {
        Ext.getStore('incomingLibrariesStore').rejectChanges();
    },

    save: function() {
        MainHub.Store.save('incomingLibrariesStore');
    },

    changeFilter: function(el, value) {
        var grid = Ext.getCmp('incomingLibraries');
        var store = grid.getStore();
        var columns = Ext.pluck(grid.getColumns(), 'dataIndex');
        var showLibraries = null;
        var showSamples = null;
        var searchQuery = null;

        if (el.itemId === 'showLibrariesCheckbox') {
            showLibraries = value;
            showSamples = el.up().items.items[1].getValue();
            searchQuery = el.up('header').down('textfield').getValue();
        } else if (el.itemId === 'showSamplesCheckbox') {
            showLibraries = el.up().items.items[0].getValue();
            showSamples = value;
            searchQuery = el.up('header').down('textfield').getValue();
        } else if (el.itemId === 'searchField') {
            showLibraries = el.up().down('fieldcontainer').items.items[0].getValue();
            showSamples = el.up().down('fieldcontainer').items.items[1].getValue();
            searchQuery = value;
        }

        var showFilter = Ext.util.Filter({
            filterFn: function(record) {
                var res = false;
                if (record.get('recordType') === 'L') {
                    res = res || showLibraries;
                } else {
                    res = res || showSamples;
                }
                return res;
            }
        });

        var searchFilter = Ext.util.Filter({
            filterFn: function(record) {
                var res = false;
                if (searchQuery) {
                    Ext.each(columns, function(column) {
                        var value = record.get(column);
                        if (value && value.toString().toLowerCase().indexOf(searchQuery.toLowerCase()) > -1) {
                            res = res || true;
                        }
                    });
                } else {
                    res = true;
                }
                return res;
            }
        });

        store.clearFilter();
        store.filter([showFilter, searchFilter]);
    }
});
