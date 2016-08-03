Ext.define('MainHub.view.tables.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-librarywindow',

    config: {
        control: {
            '#': {
                boxready: 'onLibraryWindowBoxready'
            },
            '#libraryCardBtn': {
                click: 'onCardBtnClick',
                // mouseover: 'onCardBtnMouseover'
            },
            '#sampleCardBtn': {
                click: 'onCardBtnClick',
                // mouseover: 'onCardBtnMouseover'
            },
            '#libraryCard': {
                activate: 'onLibraryCardActivate'
            },
            '#libraryProtocolField': {
                select: 'onLibraryProtocolFieldSelect'
            },
            '#indexType': {
                select: 'onIndexTypeSelect'
            },
            '#indexReadsField': {
                select: 'onIndexReadsFieldSelect'
            },
            '#saveAndAddWndBtn': {
                click: 'onSaveAndAddWndBtnClick'
            },
            '#addWndBtn': {
                click: 'onAddWndBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onLibraryWindowBoxready: function (wnd) {
        // Bypass Selection (Library/Sample) dialog if editing
        if (wnd.mode == 'edit') {
            if (wnd.record.data.recordType == 'L') {
                var libraryCardBtn = Ext.getCmp('libraryCardBtn');
                libraryCardBtn.fireEvent('click', libraryCardBtn);
            } else {
                var sampleCardBtn = Ext.getCmp('sampleCardBtn');
                sampleCardBtn.fireEvent('click', sampleCardBtn);
            }
        }
    },

    onCardBtnClick: function(btn) {
        var wnd = btn.up('library_wnd'),
            layout = btn.up('panel').getLayout();

        wnd.setSize(670, 700);
        wnd.center();
        wnd.getDockedItems('toolbar[dock="bottom"]')[0].show();

        if (btn.itemId == 'libraryCardBtn') {
            layout.setActiveItem(1);
            if (wnd.mode == 'add') {
                wnd.setTitle('Add Library');
                Ext.getCmp('libraryForm').reset();
            }
        } else {
            layout.setActiveItem(2);
            if (wnd.mode == 'add') wnd.setTitle('Add Sample');
        }
    },

    onCardBtnMouseover: function(btn) {
        var cardHelpText = Ext.getCmp('cardHelpText');
        if (btn.itemId == 'libraryCardBtn') {
            cardHelpText.setHtml('<p style="text-align:center">Choose <strong>Library</strong> if samples for sequencing are completely prepared by user</p>');
        } else {
            cardHelpText.setHtml('<p style="text-align:center">Choose <strong>Sample</strong> if libraries are prepared by facility</p>');
        }
    },

    onLibraryCardActivate: function(card) {
        var wnd = card.up('library_wnd');

        Ext.getCmp('addWndBtn').show();
        if (wnd.mode == 'add') {
            Ext.getCmp('saveAndAddWndBtn').show();
        } else {
            var record = wnd.record.data,
                form = Ext.getCmp('libraryForm').getForm();

            // Load field values
            form.setValues({
                name: record.name,
                enrichmentCycles: record.enrichmentCycles,
                DNADissolvedIn: record.DNADissolvedIn,
                concentration: record.concentration,
                sampleVolume: record.sampleVolume,
                meanFragmentSize: record.meanFragmentSize,
                qPCRResult: record.qPCRResult,
                sequencingDepth: record.sequencingDepth,
                comments: record.comments
            });
            if (record.equalRepresentation == 'No') Ext.getCmp('equalRepresentationRadio2').setValue(true);

            Ext.getCmp('addWndBtn').setConfig('text', 'Save');
        }

        // Initialize tooltips
        $.each($('.field-tooltip'), function(idx, item) {
            Ext.create('Ext.tip.ToolTip', {
                title: 'Help',
                target: item,
                html: $(item).attr('tooltip-text'),
                dismissDelay: 15000,
                maxWidth: 300
            });
        });

        // Load Library Protocols
        wnd.setLoading();
        Ext.getStore('libraryProtocolsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Library Protocols', 'error');

            if (wnd.mode == 'edit') {
                var libraryProtocolField = Ext.getCmp('libraryProtocolField');
                libraryProtocolField.select(record.libraryProtocolId);
                libraryProtocolField.fireEvent('select', libraryProtocolField, libraryProtocolField.findRecordByValue(record.libraryProtocolId));
            }

            wnd.setLoading(false);
        });

        // Load Organisms
        wnd.setLoading();
        Ext.getStore('organismsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Organisms', 'error');

            if (wnd.mode == 'edit') {
                var organismField = Ext.getCmp('organismField');
                organismField.select(record.organismId);
                organismField.fireEvent('select', organismField, organismField.findRecordByValue(record.organismId));
            }

            wnd.setLoading(false);
        });

        // Load Index Types
        wnd.setLoading();
        Ext.getStore('indexTypesStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Index Types', 'error');

            if (wnd.mode == 'edit') {
                var indexType = Ext.getCmp('indexType');
                indexType.select(record.indexTypeId);
                indexType.fireEvent('select', indexType, indexType.findRecordByValue(record.indexTypeId));
            }

            wnd.setLoading(false);
        });

        // Load Concentration Methods
        wnd.setLoading();
        Ext.getStore('concentrationMethodsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');

            if (wnd.mode == 'edit') {
                var concentrationMethodField = Ext.getCmp('concentrationMethodField');
                concentrationMethodField.select(record.concentrationMethodId);
                concentrationMethodField.fireEvent('select', concentrationMethodField, concentrationMethodField.findRecordByValue(record.concentrationMethodId));
            }

            wnd.setLoading(false);
        });

        // Load Sequencing Run Conditions
        wnd.setLoading();
        Ext.getStore('sequencingRunConditionsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Sequencing Run Conditions', 'error');

            if (wnd.mode == 'edit') {
                var sequencingRunConditionField = Ext.getCmp('sequencingRunConditionField');
                sequencingRunConditionField.select(record.sequencingRunConditionId);
                sequencingRunConditionField.fireEvent('select', sequencingRunConditionField, sequencingRunConditionField.findRecordByValue(record.sequencingRunConditionId));
            }

            wnd.setLoading(false);
        });
    },

    onLibraryProtocolFieldSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            libraryTypeStore = Ext.getStore('libraryTypeStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField');

        // Load Library Type
        wnd.setLoading();
        libraryTypeStore.load({
            params: {
                'library_protocol_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Principal Investigators', 'error');
                } else {
                    libraryTypeField.setDisabled(false);

                    if (wnd.mode == 'edit') {
                        var record = wnd.record.data;
                        libraryTypeField.select(record.libraryTypeId);
                        libraryTypeField.fireEvent('select', libraryTypeField, libraryTypeField.findRecordByValue(record.libraryTypeId));
                    }
                }
                wnd.setLoading(false);
            }
        });
    },

    onIndexTypeSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            indexReadsField = Ext.getCmp('indexReadsField'),
            indexI7Store = Ext.getStore('indexI7Store'),
            indexI5Store = Ext.getStore('indexI5Store'),
            indexI7Field = Ext.getCmp('indexI7Field'),
            indexI5Field = Ext.getCmp('indexI5Field');

        indexReadsField.enable();
        if (record.data.id == 1 || record.data.id == 2) {
            // TruSeq small RNA (I7, RPI1-RPI48) or TruSeq DNA/RNA (I7, A001 - A027):
            // # of index reads: 0,1
            indexReadsField.getStore().setData( [{id: 1, name: 0}, {id: 2, name: 1}] );
        } else {
            // Nextera (I7, N701-N712; I5 S501-S517):
            // # of index reads: 0,1,2
            indexReadsField.getStore().setData( [{id: 1, name: 0}, {id: 2, name: 1}, {id: 3, name: 2}] );
        }

        if (wnd.mode == 'edit') {
            var wndRecord = wnd.record.data;
            indexReadsField.select(wndRecord.indexReads);
            indexReadsField.fireEvent('select', indexReadsField, indexReadsField.findRecordByValue(wndRecord.indexReads));
        }

        // Remove values before loading new stores
        indexI7Field.clearValue();
        indexI5Field.clearValue();

        // Load Index I7
        wnd.setLoading();
        indexI7Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I7', 'error');

                if (wnd.mode == 'edit') {
                    indexI7Field.setValue(wndRecord.indexI7);
                }

                wnd.setLoading(false);
            }
        });

        // Load Index I5
        wnd.setLoading();
        indexI5Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I5', 'error');

                if (wnd.mode == 'edit') {
                    indexI5Field.setValue(wndRecord.indexI5);
                }

                wnd.setLoading(false);
            }
        });
    },

    onIndexReadsFieldSelect: function(fld, record) {
        var indexI7Field = Ext.getCmp('indexI7Field'),
            indexI5Field = Ext.getCmp('indexI5Field');

        if (record.data.id == 1) {
            indexI7Field.setDisabled(true);
            indexI5Field.setDisabled(true);
        } else if (record.data.id == 2) {
            indexI7Field.setDisabled(false);
            indexI5Field.setDisabled(true);
        } else {
            indexI7Field.setDisabled(false);
            indexI5Field.setDisabled(false);
        }
    },

    onSaveAndAddWndBtnClick: function() {
        this.saveLibrary(true);
    },

    onAddWndBtnClick: function() {
        this.saveLibrary();
    },

    saveLibrary: function(addAnother) {
        var form = Ext.getCmp('libraryForm'),
            wnd = form.up('library_wnd');
        addAnother = addAnother || false;

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: 'save_library/',
                timeout: 1000000,
                scope: this,

                params: {
                    'mode': wnd.mode,
                    'name': data.name,
                    'library_id': (typeof wnd.record !== 'undefined') ? wnd.record.data.id : '',
                    'library_protocol': data.libraryProtocol,
                    'library_type': data.libraryType,
                    'enrichment_cycles': data.enrichmentCycles,
                    'organism': data.organism,
                    'index_type': data.indexType,
                    'index_reads': data.indexReads,
                    'index_i7': data.indexI7,
                    'index_i5': data.indexI5,
                    'equal_representation_nucleotides': data.equalRepresentationOfNucleotides,
                    'dna_dissolved_in': data.DNADissolvedIn,
                    'concentration': data.concentration,
                    'concentration_determined_by': data.concentrationDeterminedBy,
                    'sample_volume': data.sampleVolume,
                    'mean_fragment_size': data.meanFragmentSize,
                    'qpcr_result': data.qPCRResult,
                    'sequencing_run_condition': data.sequencingRunCondition,
                    'sequencing_depth': data.sequencingDepth,
                    'comments': data.comments
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        var grid = Ext.getCmp('librariesTable');
                        grid.fireEvent('refresh', grid);

                        if (wnd.mode == 'add') {
                            Ext.ux.ToastMessage('Library has been added!');
                        } else {
                            Ext.ux.ToastMessage('Library has been updated!');
                        }

                        // Preserve all fields except for Name, if 'Save and Add another' button was pressed
                        if (addAnother) {
                            Ext.getCmp('libraryName').reset();
                            wnd.setLoading(false);
                        } else {
                            wnd.close();
                        }
                    } else {
                        if (obj.error.indexOf('duplicate key value') > -1) {
                            Ext.ux.ToastMessage('Record with name "' + data.name + '" already exists. Enter a different name.', 'error');
                        } else {
                            Ext.ux.ToastMessage(obj.error, 'error');
                        }
                        console.log('[ERROR]: save_library(): ' + obj.error);
                        console.log(response);
                        wnd.setLoading(false);
                    }
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.log('[ERROR]: save_library()');
                    console.log(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('library_wnd').close();
    }
});
