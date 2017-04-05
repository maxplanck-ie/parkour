Ext.define('MainHub.view.qualitycontrol.IncomingLibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.qualitycontrol-incominglibraries',

    config: {
        control: {
            '#incomingLibraries': {
                refresh: 'refresh',
                boxready: 'refresh',
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

    editRecord: function(editor, context) {
        var grid = Ext.getCmp('incomingLibraries'),
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            url = 'quality_check/update/';

        var params = $.extend({
            'record_type': record.getRecordType(),
            'record_id': (record.getRecordType() === 'L') ? record.get('libraryId') : record.get('sampleId')
        }, values);

        // Compute Amount
        if (Object.keys(changes).indexOf('amount_facility') === -1 && values.dilution_factor &&
            values.concentration_facility && values.sample_volume_facility) {
            var amountFacility = parseFloat(values.dilution_factor) *
                parseFloat(values.concentration_facility) *
                parseFloat(values.sample_volume_facility);
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
                        if (record.data[column].toLowerCase().indexOf(searchQuery.toLowerCase()) > -1) {
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
