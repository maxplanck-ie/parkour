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
        // Ext.getStore('libraryProtocolsStore').reload();
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
                    item.set(dataIndex, record.get(dataIndex));

                    // If Library Protocol was selected, apply Librrary Type too
                    var libraryType = record.get('library_type');
                    if (dataIndex == 'library_protocol' && libraryType !== 0) {
                        item.set('library_type', libraryType);
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

            // Reload Library Protocols store for currently selected Nucleic Acid Type
            if (record.get('library_protocol') !== 0) {
                libraryProtocolsStore.load({
                    params: {
                        'type': nucleicAcidTypesStore.findRecord('id',
                            record.get('nucleic_acid_type')
                        ).get('type')
                    }
                });
            }
        }

        // Toggle Library Type
        if (record.get('library_protocol') === 0) {
            libraryTypeEditor.disable();
        } else {
            libraryTypeEditor.enable();

            // Reload Library Types store for currently selected Library Protocol
            if (record.get('library_type') !== 0) {
                libraryTypesStore.load({
                    params: {
                        'library_protocol_id': record.get('library_protocol')
                    }
                });
            }
        }

         // Toggle RNA Quality
        if (record.get('rna_quality') === 0) {
            rnaQualityEditor.disable();
        } else {
            rnaQualityEditor.enable();
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

        libraryProtocolsStore.load({
            params: {
                'type': record.get('type')
            },
            callback: function(records, operation, success) {
                if (success) {
                    libraryProtocolEditor.enable();
                } else {
                    libraryProtocolEditor.disable();
                }
            }
        });

        if (record.get('type') === 'RNA') {
            rnaQualityEditor.enable();
        } else {
            rnaQualityEditor.disable();
        }
    },

    selectLibraryProtocol: function(fld, record) {
        var libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            libraryTypesStore = Ext.getStore('libraryTypesStore');

        libraryTypesStore.load({
            params: {
                'library_protocol_id': record.get('id')
            },
            callback: function(records, operation, success) {
                if (success) {
                    libraryTypeEditor.enable();
                } else {
                    libraryTypeEditor.disable();
                }
            }
        });
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
    }
});
