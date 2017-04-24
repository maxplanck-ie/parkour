Ext.define('MainHub.view.incominglibraries.IncomingLibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.incominglibraries-incominglibraries',

    config: {
        control: {
            '#incomingLibraries': {
                refresh: 'refresh',
                boxready: 'refresh',
                itemcontextmenu: 'showContextMenu',
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
            }
        }
    },

    refresh: function(grid) {
        // Reload the table
        grid.getStore().reload();
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

    applyToAll: function(record, dataIndex) {
        var store = Ext.getStore('incomingLibrariesStore');

        var allowedColumns = ['dilution_factor', 'concentration_facility',
            'concentration_method_facility', 'sample_volume_facility',
            'amount_facility', 'size_distribution_facility', 'comments_facility',
            'qpcr_result_facility', 'rna_quality_facility'
        ];

        if (typeof dataIndex !== 'undefined' && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('requestId') === record.get('requestId') && item !== record) {
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

    toggleEditors: function(editor, context) {
        var record = context.record,
            qPCRResultEditor = Ext.getCmp('qPCRResultEditor'),
            rnaQualityEditor = Ext.getCmp('rnaQualityIncomingEditor'),
            nucleicAcidTypesStore = Ext.getStore('nucleicAcidTypesStore');

        // Toggle qPCR Result and RNA Quality
        if (record.get('recordType') === 'L') {
            qPCRResultEditor.enable();
            rnaQualityEditor.disable();
        } else {
            qPCRResultEditor.disable();

            var nat = nucleicAcidTypesStore.findRecord('id',
                record.get('nucleicAcidTypeId')
            );

            if (nat !== null && nat.get('type') === 'RNA') {
                rnaQualityEditor.enable();
            } else {
                rnaQualityEditor.disable();
            }
        }
    },

    editRecord: function(editor, context) {
        var grid = Ext.getCmp('incomingLibraries'),
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            url = 'quality_check/update/';

        var params = $.extend({
            record_type: record.getRecordType(),
            record_id: (record.getRecordType() === 'L') ? record.get('libraryId') : record.get('sampleId')
        }, values);

        // Compute Amount
        if (Object.keys(changes).indexOf('amount_facility') === -1 &&
            values.concentration_facility && values.sample_volume_facility) {
            var amountFacility = parseFloat(values.concentration_facility) *
                parseFloat(values.sample_volume_facility);
            if (values.dilution_factor) amountFacility *= parseFloat(values.dilution_factor);
            params['amount_facility'] = amountFacility;
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
                    if (Ext.getStore('librariesStore').isLoaded()) Ext.getStore('librariesStore').reload();
                    if (Ext.getStore('PoolingTree').isLoaded()) Ext.getStore('PoolingTree').reload();
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

    changeFilter: function(el, value) {
        var grid = Ext.getCmp('incomingLibraries'),
            store = grid.getStore(),

            // TODO@me: update this after merging with feature/libraries-from-file
            columns = [
                'name',
                'barcode',
                'nucleicAcidType',
                'libraryProtocol',
                'concentration',
                'concentrationMethod',
                'sampleVolume',
                'qPCRResult',
                'meanFragmentSize',
                'rnaQuality'
            ],
            showLibraries = null,
            showSamples = null,
            searchQuery = null;

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
