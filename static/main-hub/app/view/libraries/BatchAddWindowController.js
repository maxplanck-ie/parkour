Ext.define('MainHub.view.libraries.BatchAddWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-batchaddwindow',

    config: {
        control: {
            '#': {
                boxready: 'boxready',
                close: 'clearStore'
            },
            '#batchAddGrid': {
                itemcontextmenu: 'showContextMenu',
                beforeedit: 'toggleEditors',
                edit: 'editRecord'
            },
            '#nucleicAcidTypeEditor': {
                select: 'selectNucleicAcidType'
            },
            '#libraryProtocolEditor': {
                select: 'selectLibraryProtocol'
            },
            // '#libraryTypeEditor': {
            //     select: 'selectLibraryType'
            // },
            '#createEmptyRecordsBtn': {
                click: 'createEmptyRecords'
            },
            '#saveBtn': {
                click: 'save'
            }
        }
    },

    boxready: function() {
        Ext.getStore('libraryProtocolsStore').reload();
        Ext.getStore('libraryTypesStore').reload();
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
            }, {
                text: 'Delete',
                iconCls: 'x-fa fa-trash',
                handler: function() {
                    me.delete(record, gridView);
                }
            }]
        }).showAt(e.getXY());
    },

    createEmptyRecords: function(btn) {
        var grid = Ext.getCmp('batchAddGrid'),
            store = grid.getStore(),
            numRecords = btn.up().down('#numEmptyRecords').getValue();

        if (numRecords !== null && numRecords > 0) {
            for (var index = 0; index < numRecords; index++) {
                store.add({
                    concentration: 0
                });
            }
        }
    },

    applyToAll: function(record, dataIndex) {
        var store = record.store
        if (typeof dataIndex !== 'undefined') {
            if (dataIndex === 'name') {
                Ext.ux.ToastMessage('Names must be unique.', 'warning');
                return;
            }

            store.each(function(item) {
                if (item !== record) {
                    // If Library Protocol was selected, apply Nuc. Type too
                    if (dataIndex == 'library_protocol') {
                        item.set('nucleic_acid_type', record.get('nucleic_acid_type'));
                    }

                    // If Library Type was selected, apply Library Protocol and Nuc. Type too
                    else if (dataIndex == 'library_type') {
                        item.set('library_protocol', record.get('library_protocol'));
                        item.set('nucleic_acid_type', record.get('nucleic_acid_type'));
                    }

                    // Special case: RNA Quality should be applied only when Nuc. Type is RNA
                    else if (dataIndex === 'rna_quality') {
                        var nat = Ext.getStore('nucleicAcidTypesStore').findRecord('id',
                            item.get('nucleic_acid_type')
                        );
                        if (nat !== null && nat.get('type') === 'RNA') {
                            item.set(dataIndex, record.get(dataIndex));
                        }
                    }

                    else {
                        item.set(dataIndex, record.get(dataIndex));
                    }

                    item.save();
                }
            });
        }
    },

    delete: function(record, gridView) {
        var store = record.store;
        store.remove(record);
        gridView.refresh();
    },

    toggleEditors: function(editor, context) {
        var nucleicAcidTypeEditor = Ext.getCmp('nucleicAcidTypeEditor'),
            nucleicAcidTypesStore = Ext.getStore('nucleicAcidTypesStore'),
            libraryProtocolEditor = Ext.getCmp('libraryProtocolEditor'),
            libraryProtocolsStore = Ext.getStore('libraryProtocolsStore'),
            libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            libraryTypesStore = Ext.getStore('libraryTypesStore'),
            rnaQualityEditor = Ext.getCmp('rnaQualityEditor'),
            record = context.record;

        // Toggle Library Protocol
        if (record.get('nucleic_acid_type') === 0) {
            libraryProtocolEditor.disable();
        } else {
            libraryProtocolEditor.enable();

            // Filter Library Protocols store for currently selected Nucleic Acid Type
            if (record.get('library_protocol') !== 0) {
                var type = nucleicAcidTypesStore.findRecord('id',
                    record.get('nucleic_acid_type')
                ).get('type');
                this.filterLibraryProtocols(libraryProtocolsStore, type);
            }
        }

        // Toggle Library Type
        if (record.get('library_protocol') === 0) {
            libraryTypeEditor.disable();
        } else {
            libraryTypeEditor.enable();

            // Filter Library Types store for currently selected Library Protocol
            if (record.get('library_type') !== 0) {
                this.filterLibraryTypes(libraryTypesStore, record.get('library_protocol'));
            }
        }

         // Toggle RNA Quality
        var nat = nucleicAcidTypesStore.findRecord('id',
            record.get('nucleic_acid_type')
        );
        if (nat !== null && nat.get('type') === 'RNA') {
            rnaQualityEditor.enable();
        } else {
            rnaQualityEditor.disable();
        }
    },

    editRecord: function(editor, context) {
        var grid = Ext.getCmp('batchAddGrid'),
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues;

        for (var dataIndex in changes) {
            if (changes.hasOwnProperty(dataIndex)) {
                record.set(dataIndex, changes[dataIndex]);
            }
        }

        // Reset Library Type if Library Protocol is empty
        if (record.get('library_protocol') === 0 && record.get('library_type') !== 0) {
            record.set('library_type', 0);
        }

        record.save();
    },

    selectNucleicAcidType: function(fld, record) {
        var libraryProtocolEditor = Ext.getCmp('libraryProtocolEditor'),
            libraryProtocolsStore = Ext.getStore('libraryProtocolsStore'),
            libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            rnaQualityEditor = Ext.getCmp('rnaQualityEditor');

        libraryTypeEditor.setValue(null);
        libraryTypeEditor.disable();

        this.filterLibraryProtocols(libraryProtocolsStore, record.get('type'));
        libraryProtocolEditor.enable();

        if (record.get('type') === 'RNA') {
            rnaQualityEditor.enable();
        } else {
            rnaQualityEditor.disable();
        }
    },

    selectLibraryProtocol: function(fld, record) {
        var libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            libraryTypesStore = Ext.getStore('libraryTypesStore');
        this.filterLibraryTypes(libraryTypesStore, record.get('id'));
        libraryTypeEditor.enable();
    },

    // selectLibraryType: function(fld, record) {

    // },

    save: function() {
        // TODO@me: verify all records before saving
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
    },

    clearStore: function() {
        var store = Ext.getCmp('batchAddGrid').getStore();
        store.removeAll();
    },

    filterLibraryProtocols: function(store, value) {
        store.clearFilter();
        store.filterBy(function(item) {
            return item.get('type') === value;
        });
    },

    filterLibraryTypes: function(store, value) {
        store.clearFilter();
        store.filterBy(function(item) {
            return item.get('protocol').indexOf(value) !== -1;
        });
    }
});
