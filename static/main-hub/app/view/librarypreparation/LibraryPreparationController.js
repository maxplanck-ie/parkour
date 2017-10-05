Ext.define('MainHub.view.librarypreparation.LibraryPreparationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.library-preparation',

    mixins: [
        'MainHub.grid.SearchInputMixin',
        'MainHub.grid.ContextMenuMixin',
        'MainHub.store.SyncStoreMixin'
    ],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#library-preparation-grid': {
                // refresh: 'refresh',
                edit: 'editRecord',
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu'
            },
            '#download-benchtop-protocol-button': {
                click: 'downloadBenchtopProtocol'
            },
            '#search-field': {
                change: 'changeFilter'
            },
            '#cancel-button': {
                click: 'cancel'
            },
            '#save-button': {
                click: 'save'
            }
        }
    },

    activateView: function() {
        Ext.getStore('libraryPreparationStore').reload();
    },

    // refresh: function(grid) {
    //     // Ext.getStore('libraryPreparationStore').load(function(records, operation, success) {
    //     //     if (success && records.length > 0) {
    //     //         Ext.getCmp('downloadBenchtopProtocolLPBtn').setDisabled(false);
    //     //     }
    //     // });
    //     Ext.getStore('libraryPreparationStore').reload();
    // },

    selectUnselectAll: function(libraryProtocolId, selected) {
        var store = Ext.getStore('libraryPreparationStore');

        store.each(function(item) {
            if (item.get('library_protocol') === libraryProtocolId) {
                item.set('selected', selected);
            }
        });
    },

    editRecord: function(editor, context) {
        var record = context.record;
        var changes = record.getChanges();
        var values = context.newValues;

        // Set nM
        if (Object.keys(changes).indexOf('nM') === -1 &&
            values.concentration_library > 0 &&
            values.mean_fragment_size > 0) {
            var nM = ((values.concentration_library /
                (values.mean_fragment_size * 650)) * 1000000).toFixed(2);
            record.set('nM', nM);
        }

        // Send the changes to the server
        this.syncStore('libraryPreparationStore');
    },

    applyToAll: function(record, dataIndex) {
        var store = Ext.getStore('libraryPreparationStore');
        var allowedColumns = ['starting_amount', 'starting_volume',
            'spike_in_description', 'spike_in_volume', 'pcr_cycles',
            'concentration_library', 'mean_fragment_size', 'nM',
            'concentration_sample', 'comments_facility', 'comments',
            'qpcr_result'];
        var nMFormulaDataIndices = ['concentration_library', 'mean_fragment_size'];

        if (typeof dataIndex !== undefined && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('library_protocol') === record.get('library_protocol') && item !== record) {
                    item.set(dataIndex, record.get(dataIndex));

                    // Calculate nM
                    if (nMFormulaDataIndices.indexOf(dataIndex) !== -1) {
                        var concentrationLibrary = item.get('concentration_library');
                        var meanFragmentSize = item.get('mean_fragment_size');
                        if (concentrationLibrary && meanFragmentSize) {
                            var nM = ((concentrationLibrary /
                                (meanFragmentSize * 650)) * 1000000).toFixed(2);;
                            item.set('nM', nM);
                        }
                    }
                }
            });

            // Send the changes to the server
            this.syncStore('libraryPreparationStore');
        }
    },

    qualityCheckAll: function(libraryProtocolId, result) {
        var store = Ext.getStore('libraryPreparationStore');

        store.each(function(item) {
            if (item.get('library_protocol') === libraryProtocolId && item.get('selected')) {
                item.set('quality_check', result);
            }
        });

        if (store.getModifiedRecords().length === 0) {
            new Noty({
                text: 'You did not select any records.',
                type: 'warning'
            }).show();
            return;
        }

        // Send the changes to the server
        this.syncStore('libraryPreparationStore');
    },

    downloadBenchtopProtocol: function(btn) {
        var store = Ext.getStore('libraryPreparationStore');
        var ids = [];

        // Get all checked (selected) records
        store.each(function(record) {
            if (record.get('selected')) {
                ids.push(record.get('pk'));
            }
        });

        if (ids.length === 0) {
            new Noty({
                text: 'You did not select any records.',
                type: 'warning'
            }).show();
            return;
        }

        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true
        });

        form.submit({
            url: 'library_preparation/download_benchtop_protocol/',
            target: '_blank',
            params: {
                'ids': Ext.JSON.encode(ids)
            }
        });
    },

    save: function() {
        // Send the changes to the server
        this.syncStore('libraryPreparationStore');
    },

    cancel: function() {
        Ext.getStore('libraryPreparationStore').rejectChanges();
    }
});
