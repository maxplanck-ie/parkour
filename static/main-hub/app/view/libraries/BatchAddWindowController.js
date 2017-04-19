Ext.define('MainHub.view.libraries.BatchAddWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-batchaddwindow',

    config: {
        control: {
            '#': {
                boxready: 'boxready'
            },
            '#libraryCardBtn': {
                click: 'selectCard'
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

            // Libraries only
            '#indexTypeEditor': {
                select: 'selectIndexType'
            },
            '#indexReadsEditor': {
                select: 'selectIndexReads'
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
            wnd.recordType = 'L';
            wnd.setTitle('Add Libraries');
            configuration = this.getLibraryGridConfiguration();
        } else {
            wnd.recordType = 'S';
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
            var data = [];
            for (var i = 0; i < numRecords; i++) {
                data.push({
                    concentration: 0
                });
            }
            store.add(data);
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
                    if (dataIndex === 'index_type') {
                        // Reset Index reads, Index I7, and Index I5,
                        // if index types don't match
                        if (item.get('index_type') !== record.get('index_type')) {
                            item.set({
                                index_reads: null,
                                index_i7: '',
                                index_i5: ''
                            });
                        }

                        item.set('index_type', record.get('index_type'));
                    }

                    // If the # of Indes Reads was selected, update Index Type too
                    else if (dataIndex === 'index_reads') {
                        item.set({
                            index_reads: record.get('index_reads'),
                            index_type: record.get('index_type'),

                            // Reset Index I7 and Index I5 for all other records
                            index_i7: '',
                            index_i5: ''
                        });
                    }

                    // If Index I7 was selected, update the # of Index Reads and Index Type too
                    else if (dataIndex === 'index_i7') {
                        // Reset Index I5 for records with different Index Type and Index Reads
                        if ((item.get('index_type') !== record.get('index_type')) &&
                            (item.get('index_reads') !== record.get('index_reads'))) {
                            item.set('index_i5', '');
                        }

                        item.set({
                            index_i7: '',
                            index_reads: record.get('index_reads'),
                            index_type: record.get('index_type')
                        });
                    }

                    // If Index I5 was selected, update IndexI7, the # of Index Reads, and Index Type too
                    else if (dataIndex === 'index_i5') {
                        item.set({
                            index_i5: record.get('index_i5'),
                            index_i7: record.get('index_i7'),
                            index_reads: record.get('index_reads'),
                            index_type: record.get('index_type')
                        });
                    }

                    // Update Nucleic Acid Type
                    else if (dataIndex === 'nucleic_acid_type') {
                        // Reset Library Protocol and Library Type for records
                        // with a different Nucleic Acid Type
                        if (item.get('nucleic_acid_type') !== record.get('nucleic_acid_type')) {
                            item.set({
                                library_protocol: null,
                                library_type: null
                            });
                        }

                        item.set('nucleic_acid_type', record.get('nucleic_acid_type'));
                    }

                    // If Library Protocol was selected, update Nuc. Type too
                    else if (dataIndex === 'library_protocol') {
                        // Libraries
                        if (typeof item.get('nucleic_acid_type') === 'undefined') {
                            // Reset Library Type for records with a different Library Protocol
                            if (item.get('library_protocol') !== record.get('library_protocol')) {
                                item.set('library_type', null);
                            }
                        }
                        // Samples
                        else {
                            // Reset Library Type, if Nucleic Acid Types are different or
                            // Library Protocols are different
                            if ((item.get('nucleic_acid_type') !== record.get('nucleic_acid_type')) ||
                                ((item.get('nucleic_acid_type') === record.get('nucleic_acid_type')) &&
                                    (item.get('library_protocol') !== record.get('library_protocol')))) {
                                item.set('library_type', null);
                            }
                            item.set('nucleic_acid_type', record.get('nucleic_acid_type'));
                        }
                        item.set('library_protocol', record.get('library_protocol'));
                    }

                    // If Library Type was selected, update Library Protocol and Nuc. Type too
                    else if (dataIndex === 'library_type') {
                        item.set({
                            library_type: record.get('library_type'),
                            library_protocol: record.get('library_protocol'),
                            nucleic_acid_type: record.get('nucleic_acid_type')
                        });
                    }

                    // RNA Quality should be applied only when Nuc. Type is RNA
                    else if (dataIndex === 'rna_quality') {
                        var nat = Ext.getStore('nucleicAcidTypesStore').findRecord('id',
                            item.get('nucleic_acid_type')
                        );
                        if (nat !== null && nat.get('type') === 'RNA') {
                            item.set(dataIndex, record.get(dataIndex));
                        }
                    } else {
                        item.set(dataIndex, record.get(dataIndex));
                    }

                    item.commit();
                }
            });

            // Validate all records
            this.validateAll();
        }
    },

    delete: function(record, gridView) {
        var store = record.store;
        store.remove(record);
        gridView.refresh();
    },

    toggleEditors: function(editor, context) {
        var wnd = this.getView(),
            indexTypeEditor = Ext.getCmp('indexTypeEditor'),
            indexReadsEditor = Ext.getCmp('indexReadsEditor'),
            indexI7Editor = Ext.getCmp('indexI7Editor'),
            indexI5Editor = Ext.getCmp('indexI5Editor'),
            nucleicAcidTypeEditor = Ext.getCmp('nucleicAcidTypeEditor'),
            nucleicAcidTypesStore = Ext.getStore('nucleicAcidTypesStore'),
            libraryProtocolEditor = Ext.getCmp('libraryProtocolEditor'),
            libraryProtocolsStore = Ext.getStore('libraryProtocolsStore'),
            libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            libraryTypesStore = Ext.getStore('libraryTypesStore'),
            rnaQualityEditor = Ext.getCmp('rnaQualityEditor'),
            record = context.record;

        // Toggle Library Type
        if (record.get('library_protocol') === null) {
            libraryTypeEditor.disable();
        } else {
            libraryTypeEditor.enable();

            // Filter Library Types store for currently selected Library Protocol
            this.filterLibraryTypes(libraryTypesStore, record.get('library_protocol'));
        }

        // Libraries
        if (wnd.recordType === 'L') {
            // Toggle Index Reads, IndexI7, and IndexI5
            if (record.get('index_type') !== null) {
                if (record.get('index_reads') !== null) {
                    indexTypeEditor.fireEvent('select', indexTypeEditor,
                        indexTypeEditor.findRecordByValue(record.get('index_type'))
                    );

                    // Toggle IndexI7 and IndexI5
                    indexReadsEditor.fireEvent('select', indexReadsEditor,
                        indexReadsEditor.findRecordByValue(record.get('index_reads'))
                    );
                } else {
                    indexI7Editor.disable();
                    indexI5Editor.disable();
                }
            } else {
                indexReadsEditor.disable();
                indexI7Editor.disable();
                indexI5Editor.disable();
            }
        }

        // Samples
        else {
            // Toggle Library Protocol
            if (record.get('nucleic_acid_type') === null) {
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

            // Toggle RNA Quality
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

    editRecord: function(editor, context) {
        var grid = Ext.getCmp('batchAddGrid'),
            store = grid.getStore(),
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues;

        for (var dataIndex in changes) {
            if (changes.hasOwnProperty(dataIndex)) {
                record.set(dataIndex, changes[dataIndex]);
            }
        }

        // Reset Library Type if Library Protocol is empty
        if (record.get('library_protocol') === null && record.get('library_type') !== null) {
            record.set('library_type', null);
        }

        // Reset Index I7 and Index I5 if # Index reads is 1 or 0
        if (record.get('index_reads') === 1 && record.get('index_i5') !== '') {
            record.set('index_i5', '');
        } else if (record.get('index_reads') === 0 && record.get('index_i7') !== '' &&
            record.get('index_i5') !== '') {
            item.set({
                index_i7: '',
                index_i5: ''
            });
        }

        // Reset RNA Quality if Nucleic Acid Type has changed
        var nat = Ext.getStore('nucleicAcidTypesStore').findRecord('id',
            record.get('nucleic_acid_type')
        );
        if (nat !== null && nat.get('type') === 'DNA' && record.get('rna_quality') > 0) {
            record.set('rna_quality', null);
        }

        record.commit();

        // Validate the record after editing and refresh the grid
        this.validateRecord(record);
        grid.getView().refresh();
    },

    selectLibraryProtocol: function(fld, record) {
        var libraryTypeEditor = Ext.getCmp('libraryTypeEditor'),
            libraryTypesStore = Ext.getStore('libraryTypesStore');
        this.filterLibraryTypes(libraryTypesStore, record.get('id'));
        libraryTypeEditor.enable();
    },

    selectIndexType: function(fld, record) {
        var indexReadsEditor = Ext.getCmp('indexReadsEditor'),
            indexI7Editor = Ext.getCmp('indexI7Editor'),
            indexI5Editor = Ext.getCmp('indexI5Editor'),
            indexI7Store = Ext.getStore('indexI7Store'),
            indexI5Store = Ext.getStore('indexI5Store');

        indexReadsEditor.setValue(null);
        indexReadsEditor.getStore().removeAll();
        indexReadsEditor.enable();

        for (var i = 0; i <= record.get('indexReads'); i++) {
            indexReadsEditor.getStore().add({
                num: i
            });
        }

        // Remove values before loading new stores
        indexI7Editor.setValue(null);
        indexI5Editor.setValue(null);
        indexI7Editor.disable();
        indexI5Editor.disable();

        // Reload stores
        indexI7Store.reload({
            params: {
                'index_type_id': record.get('id')
            }
        });
        indexI5Store.reload({
            params: {
                'index_type_id': record.get('id')
            }
        });
    },

    selectIndexReads: function(fld, record) {
        var indexI7Editor = Ext.getCmp('indexI7Editor'),
            indexI5Editor = Ext.getCmp('indexI5Editor');

        if (record.get('num') === 1) {
            indexI7Editor.enable();
            indexI5Editor.disable();
            indexI5Editor.setValue(null);
        } else if (record.get('num') === 2) {
            indexI7Editor.enable();
            indexI5Editor.enable();
        } else {
            indexI7Editor.disable();
            indexI5Editor.disable();
            indexI7Editor.setValue(null);
            indexI5Editor.setValue(null);
        }
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

    getLibraryGridConfiguration: function() {
        var me = this;

        var store = Ext.create('Ext.data.Store', {
            model: 'MainHub.model.libraries.BatchAdd.Library',
            data: []
        });

        var columns = $.merge(this.getCommonColumns(), [{
                text: 'size (bp)',
                dataIndex: 'mean_fragment_size',
                tooltip: 'Mean Fragment Size',
                width: 100,
                editor: {
                    xtype: 'numberfield',
                    allowDecimals: false,
                    minValue: 0
                },
                renderer: me.errorRenderer
            },
            {
                text: 'Index Type',
                dataIndex: 'index_type',
                tooltip: 'Index Type',
                width: 100,
                editor: {
                    xtype: 'combobox',
                    id: 'indexTypeEditor',
                    itemId: 'indexTypeEditor',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: 'indexTypesStore',
                    matchFieldWidth: false,
                    forceSelection: true
                },
                renderer: me.comboboxErrorRenderer
            },
            {
                text: '# of Index Reads',
                dataIndex: 'index_reads',
                tooltip: 'Index Type',
                width: 130,
                editor: {
                    xtype: 'combobox',
                    id: 'indexReadsEditor',
                    itemId: 'indexReadsEditor',
                    queryMode: 'local',
                    displayField: 'num',
                    valueField: 'num',
                    store: Ext.create('Ext.data.Store', {
                        fields: [{
                            name: 'num',
                            type: 'int'
                        }],
                        data: []
                    }),
                    forceSelection: true
                },
                renderer: function(value, meta, record) {
                    var store = meta.column.getEditor().getStore();

                    var item = store.findRecord('num', value),
                        dataIndex = meta.column.dataIndex;
                    if (record && Object.keys(record.get('errors')).indexOf(dataIndex) !== -1) {
                        meta.tdCls += ' invalid-record';
                        meta.tdAttr = 'data-qtip="' + record.get('errors')[dataIndex] + '"';
                    }
                    return (item !== null) ? item.get('num') : '';
                }
            },
            {
                text: 'Index I7',
                dataIndex: 'index_i7',
                tooltip: 'Index I7',
                width: 120,
                editor: {
                    xtype: 'combobox',
                    id: 'indexI7Editor',
                    itemId: 'indexI7Editor',
                    queryMode: 'local',
                    displayField: 'name',
                    displayTpl: Ext.create('Ext.XTemplate',
                        '<tpl for=".">',
                        '{index}',
                        '</tpl>'
                    ),
                    valueField: 'index',
                    store: 'indexI7Store',
                    regex: new RegExp('^(?=(?:.{6}|.{8})$)[ATCG]+$'),
                    regexText: 'Only A, T, C and G (uppercase) are allowed. Index length must be 6 or 8.',
                    matchFieldWidth: false
                },
                renderer: me.errorRenderer
            },
            {
                text: 'Index I5',
                dataIndex: 'index_i5',
                tooltip: 'Index I5',
                width: 120,
                editor: {
                    xtype: 'combobox',
                    id: 'indexI5Editor',
                    itemId: 'indexI5Editor',
                    queryMode: 'local',
                    displayField: 'name',
                    displayTpl: Ext.create('Ext.XTemplate',
                        '<tpl for=".">',
                        '{index}',
                        '</tpl>'
                    ),
                    valueField: 'index',
                    store: 'indexI5Store',
                    regex: new RegExp('^(?=(?:.{6}|.{8})$)[ATCG]+$'),
                    regexText: 'Only A, T, C and G (uppercase) are allowed. Index length must be 6 or 8.',
                    matchFieldWidth: false
                },
                renderer: me.errorRenderer
            },
            {
                text: 'qPCR (nM)',
                dataIndex: 'qpcr_result',
                tooltip: 'qPCR Result (nM)',
                width: 85,
                editor: {
                    xtype: 'numberfield',
                    allowBlank: true,
                    minValue: 0
                }
            }
        ]);

        // Sort columns
        var order = ['numberer', 'name',
            'library_protocol', 'library_type', 'concentration',
            'mean_fragment_size', 'index_type', 'index_reads',
            'index_i7', 'index_i5', 'read_length', 'sequencing_depth',
            'amplification_cycles', 'equal_representation_nucleotides',
            'qpcr_result', 'sample_volume', 'concentration_method',
            'organism', 'comments'
        ];
        columns = this.sortColumns(columns, order);

        return [store, columns];
    },

    getSampleGridConfiguration: function() {
        var me = this;

        var store = Ext.create('Ext.data.Store', {
            model: 'MainHub.model.libraries.BatchAdd.Sample',
            data: []
        });

        var columns = $.merge(this.getCommonColumns(), [{
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
                renderer: me.comboboxErrorRenderer
            },
            {
                text: 'RQN',
                dataIndex: 'rna_quality',
                tooltip: 'RNA Quality',
                width: 80,
                editor: {
                    xtype: 'combobox',
                    id: 'rnaQualityEditor',
                    queryMode: 'local',
                    valueField: 'value',
                    displayField: 'name',
                    displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{value}</tpl>'),
                    store: 'rnaQualityStore',
                    regex: new RegExp('^(11|10|[1-9]?(\.[0-9]+)?|\.[0-9]+)$'),
                    regexText: 'Only values between 1 and 10 are allowed.'
                },
                renderer: me.errorRenderer
            }
        ]);

        // Sort columns
        var order = ['numberer', 'name', 'nucleic_acid_type',
            'library_protocol', 'library_type', 'concentration', 'rna_quality',
            'read_length', 'sequencing_depth', 'amplification_cycles',
            'equal_representation_nucleotides', 'sample_volume',
            'concentration_method', 'organism', 'comments'
        ];
        columns = this.sortColumns(columns, order);

        return [store, columns];
    },

    sortColumns: function(columns, order) {
        var orderMap = {};

        _.each(order, function(i) {
            orderMap[i] = _.indexOf(order, i);
        });

        return _.sortBy(columns, function(column) {
            return orderMap[column.dataIndex];
        });
    },

    getCommonColumns: function() {
        var me = this;
        return [{
                xtype: 'rownumberer',
                dataIndex: 'numberer',
                width: 40
            },
            {
                text: 'Name',
                dataIndex: 'name',
                tooltip: 'Name',
                minWidth: 200,
                flex: 1,
                editor: {
                    xtype: 'textfield'
                },
                renderer: me.errorRenderer
            },
            {
                text: 'Protocol',
                dataIndex: 'library_protocol',
                tooltip: 'Library Preparation Protocol',
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
                            return '<span data-qtip="' +
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
                renderer: me.comboboxErrorRenderer
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
                renderer: me.comboboxErrorRenderer
            },
            {
                text: 'ng/μl',
                dataIndex: 'concentration',
                tooltip: 'Concentration',
                width: 90,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0
                },
                renderer: me.errorRenderer
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
                renderer: me.comboboxErrorRenderer
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
                },
                renderer: me.errorRenderer
            },
            {
                text: 'Amplification',
                tooltip: 'Amplification cycles',
                dataIndex: 'amplification_cycles',
                width: 105,
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    allowDecimals: false,
                    allowBlank: true
                },
                renderer: me.errorRenderer
            },
            {
                xtype: 'checkcolumn',
                text: 'Equal nucl.',
                tooltip: 'Equal Representation of Nucleotides: check = Yes, no check = No',
                dataIndex: 'equal_representation_nucleotides',
                width: 95,
                editor: {
                    xtype: 'checkbox',
                    cls: 'x-grid-checkheader-editor'
                }
            },
            {
                text: 'F/S',
                dataIndex: 'concentration_method',
                tooltip: 'Concentration Determined by',
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
                renderer: me.comboboxErrorRenderer
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
                renderer: me.comboboxErrorRenderer
            },
            {
                text: 'Comments',
                dataIndex: 'comments',
                tooltip: 'Comments',
                width: 200,
                editor: {
                    // xtype: 'textarea',
                    xtype: 'textfield',
                    allowBlank: true
                }
            }
        ]
    },

    save: function(btn) {
        var wnd = btn.up('window'),
            store = Ext.getCmp('batchAddGrid').getStore(),
            url = (wnd.recordType === 'L') ? 'library/save/' : 'sample/save/';

        if (store.getCount() > 0) {
            this.validateAll();

            var numInvalidRecords = store.data.items.reduce(function(n, item) {
                return n + (item.get('invalid') === true);
            }, 0);

            if (numInvalidRecords === 0) {
                // wnd.setLoading('Saving...');
                Ext.Ajax.request({
                    url: url,
                    timeout: 1000000,
                    scope: this,
                    params: {
                        mode: 'add',
                        records: Ext.JSON.encode(Ext.Array.pluck(store.data.items, 'data'))
                    },

                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        Ext.getCmp('librariesInRequestTable').getStore().add(obj.data);

                        for (var i = 0; i < obj.data.length; i++) {
                            var record = store.findRecord('name', obj.data[i].name);
                            store.remove(record);
                        }

                        if (obj.error.length === 0) {
                            Ext.ux.ToastMessage('Records have been added!');
                            wnd.close()
                        } else {
                            var errorMessage = '<ul>';
                            for (var i = 0; i < obj.error.length; i++) {
                                errorMessage += '<li>' + obj.error[i].name +
                                    ': ' + obj.error[i].value + '</li>';
                            }
                            errorMessage += '</ul>';
                            Ext.ux.ToastMessage(errorMessage, 'error');
                        }

                        // wnd.setLoading(false);
                    },

                    failure: function(response) {
                        // wnd.setLoading(false);
                        Ext.ux.ToastMessage(response.statusText, 'error');
                        console.error('[ERROR]: ' + url);
                        console.error(response);
                    }
                });
            } else {
                Ext.ux.ToastMessage('Check the records.', 'warning');
            }
        }
    },

    validateAll: function() {
        var me = this,
            grid = Ext.getCmp('batchAddGrid'),
            store = grid.getStore();

        // Validate all records
        store.each(function(record) {
            me.validateRecord(record);
        });

        // Refresh the grid
        grid.getView().refresh();
    },

    validateRecord: function(record) {
        var grid = Ext.getCmp('batchAddGrid'),
            store = grid.getStore(),
            validation = record.getValidation(true).data,
            invalid = false,
            errors = {};

        for (var dataIndex in validation) {
            if (validation.hasOwnProperty(dataIndex)) {
                if (validation[dataIndex] !== true) {
                    invalid = true;
                    errors[dataIndex] = validation[dataIndex];
                }
            }
        }

        store.suspendEvents();
        record.set({
            invalid: invalid,
            errors: errors
        });
        store.resumeEvents();

        return errors;
    },

    errorRenderer: function(value, meta, record) {
        var dataIndex = meta.column.dataIndex,
            errors = record.get('errors');
        if (Object.keys(errors).indexOf(dataIndex) !== -1) {
            meta.tdCls += ' invalid-record';
            meta.tdAttr = 'data-qtip="' + errors[dataIndex] + '"';
        }
        if (dataIndex === 'rna_quality' && value === 11) {
            return 'Determined by Facility';
        }
        return value;
    },

    comboboxErrorRenderer: function(value, meta, record) {
        var store = meta.column.getEditor().getStore();
        store.clearFilter();
        var item = store.findRecord('id', value),
            dataIndex = meta.column.dataIndex;
        if (record && Object.keys(record.get('errors')).indexOf(dataIndex) !== -1) {
            meta.tdCls += ' invalid-record';
            meta.tdAttr = 'data-qtip="' + record.get('errors')[dataIndex] + '"';
        }
        return (item !== null) ? item.get('name') : '';
    }
});
