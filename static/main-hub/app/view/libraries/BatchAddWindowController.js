Ext.define('MainHub.view.libraries.BatchAddWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-batchaddwindow',

    config: {
        control: {
            '#': {
                boxready: 'boxready'
            },
            '#libraryCardBtn': {
                // click: 'selectCard'
            },
            '#sampleCardBtn': {
                click: 'selectCard'
            },
            '#batchAddGrid': {
                itemcontextmenu: 'showContextMenu',
                beforeedit: 'toggleEditors',
                edit: 'editRecord'
            },
            '#createEmptyRecordsBtn': {
                click: 'createEmptyRecords'
            },
            '#saveBtn': {
                click: 'save'
            },

            // Samples only
            '#nucleicAcidTypeEditor': {
                select: 'selectNucleicAcidType'
            },
            '#libraryProtocolEditor': {
                select: 'selectLibraryProtocol'
            }
        }
    },

    boxready: function() {
        Ext.getStore('libraryProtocolsStore').reload();
        Ext.getStore('libraryTypesStore').reload();
    },

    selectCard: function(btn) {
        var wnd = btn.up('window'),
            layout = btn.up('panel').getLayout(),
            configuration;

        wnd.setSize(1000, 650);
        wnd.center();
        wnd.getDockedItems('toolbar[dock="bottom"]')[0].show();
        layout.setActiveItem(1);

        if (btn.itemId == 'libraryCardBtn') {
            wnd.setTitle('Add Libraries');
            // configuration = this.getlibraryGridConfiguration();
        } else {
            wnd.setTitle('Add Samples');
            configuration = this.getSampleGridConfiguration();
        }

        var grid = Ext.getCmp('batchAddGrid');
        grid.reconfigure(configuration[0], configuration[1]);
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
            rnaQualityEditor.setValue(null);
            rnaQualityEditor.disable();
        }
    },

    selectLibraryProtocol: function(fld, record) {
        var libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            libraryTypesStore = Ext.getStore('libraryTypesStore');
        this.filterLibraryTypes(libraryTypesStore, record.get('id'));
        libraryTypeEditor.enable();
    },

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
    },

    getSampleGridConfiguration: function(grid) {
        var store = Ext.create('Ext.data.Store', {
            fields: [{
                    type: 'string',
                    name: 'name'
                },
                {
                    type: 'int',
                    name: 'nucleic_acid_type'
                },
                {
                    type: 'int',
                    name: 'library_protocol'
                },
                {
                    type: 'int',
                    name: 'library_type'
                },
                {
                    type: 'string',
                    name: 'sequencing_depth'
                },
                {
                    type: 'string',
                    name: 'concentration'
                },
                {
                    type: 'int',
                    name: 'concentration_method'
                },
                {
                    type: 'int',
                    name: 'rna_quality'
                },
                {
                    type: 'string',
                    name: 'sample_volume'
                },
                {
                    type: 'string',
                    name: 'amplification_cycles'
                },
                {
                    type: 'bool',
                    name: 'equal_representation_nucleotides'
                },
                {
                    type: 'int',
                    name: 'read_length'
                },
                {
                    type: 'int',
                    name: 'organism'
                },
                {
                    type: 'string',
                    name: 'comments'
                }
            ],
            // validations: [{
            //     type: 'presence',
            //     field: 'name'
            // }],
            data: []
        });

        var columns = [
            {
                xtype: 'rownumberer',
                width: 40
            },
            {
                text: 'Name',
                dataIndex: 'name',
                tooltip: 'Sample Name',
                minWidth: 200,
                flex: 1,
                editor: {
                    xtype: 'textfield'
                }
            },
            {
                text: 'Nuc. Type',
                dataIndex: 'nucleic_acid_type',
                tooltip: 'Nucleic Acid Type',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    id: 'nucleicAcidTypeEditor',
                    itemId: 'nucleicAcidTypeEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'nucleicAcidTypesStore',
                    matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('nucleicAcidTypesStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Protocol',
                dataIndex: 'library_protocol',
                tooltip: 'Library Protocol',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    id: 'libraryProtocolEditor',
                    itemId: 'libraryProtocolEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'libraryProtocolsStore',
                    matchFieldWidth: false,
                    forceSelection: true,
                    listConfig: {
                        getInnerTpl: function() {
                            return '<span data-qtip="'+
                                     '<strong>Provider</strong>: {provider}<br/>' +
                                     '<strong>Catalog</strong>: {catalog}<br/>' +
                                     '<strong>Explanation</strong>: {explanation}<br/>' +
                                     '<strong>Input Requirements</strong>: {inputRequirements}<br/>' +
                                     '<strong>Typical Application</strong>: {typicalApplication}<br/>' +
                                     '<strong>Comments</strong>: {comments}' +
                                   '">{name}</span>'
                        }
                    }
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('libraryProtocolsStore');
                    store.clearFilter();
                    var record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Library Type',
                dataIndex: 'library_type',
                tooltip: 'Library Type',
                width: 200,
                editor: {
                    xtype: 'combobox',
                    id: 'libraryTypeEditor',
                    itemId: 'libraryTypeEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'libraryTypesStore',
                    // matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('libraryTypesStore');
                    store.clearFilter();
                    var record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'ng/μl',
                dataIndex: 'concentration',
                tooltip: 'Concentration',
                width: 70,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },
            {
                text: 'RQN',
                dataIndex: 'rna_quality',
                tooltip: 'RNA Quality',
                width: 70,
                editor: {
                    xtype: 'combobox',
                    id: 'rnaQualityEditor',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'rnaQualityStore',
                    matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('rnaQualityStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Length',
                dataIndex: 'read_length',
                tooltip: 'Read Length',
                width: 70,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'readLengthsStore',
                    matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('readLengthsStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Depth (M)',
                dataIndex: 'sequencing_depth',
                tooltip: 'Sequencing Depth',
                width: 85,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    allowDecimals: false
                }
            },
            {
                text: 'Amplification',
                tooltip: 'Amplification cycles',
                dataIndex: 'amplification_cycles',
                width: 105,
                editor: {
                    xtype: 'numberfield',
                    minValue: 1,
                    allowDecimals: false,
                    allowBlank: true
                }
            },
            {
                xtype: 'checkcolumn',
                text: 'Equal nucl.',
                tooltip: 'Equal Representation of Nucleotides',
                dataIndex: 'equal_representation_nucleotides',
                width: 95,
                editor: {
                    xtype: 'checkbox',
                    cls: 'x-grid-checkheader-editor'
                }
            },
            {
                text: 'μl',
                dataIndex: 'sample_volume',
                tooltip: 'Sample Volume',
                width: 70,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                }
            },
            {
                text: 'Method',
                dataIndex: 'concentration_method',
                tooltip: 'Concentration Method',
                width: 80,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'concentrationMethodsStore',
                    matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('concentrationMethodsStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Organism',
                dataIndex: 'organism',
                tooltip: 'Organism',
                width: 100,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    store: 'organismsStore',
                    // matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: function(val, meta) {
                    var store = Ext.getStore('organismsStore'),
                        record = store.findRecord('id', val);
                    return (record !== null) ? record.get('name') : '';
                }
            },
            {
                text: 'Comments',
                dataIndex: 'comments',
                tooltip: 'Comments',
                width: 150,
                editor: {
                    // xtype: 'textarea',
                    xtype: 'textfield',
                    allowBlank: true
                }
            }
        ];

        return [store, columns];
    }
});
