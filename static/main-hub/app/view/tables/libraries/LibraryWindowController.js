Ext.define('MainHub.view.tables.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-librarywindow',

    config: {
        control: {
            '#': {
                boxready: 'onLibraryWindowBoxready'
            },
            '#libraryCardBtn': {
                click: 'onCardBtnClick'
            },
            '#sampleCardBtn': {
                click: 'onCardBtnClick'
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
            '#sampleCard': {
                activate: 'onSampleCardActivate'
            },
            '#nucleicAcidTypeField': {
                select: 'onNucleicAcidTypeFieldSelect'
            },
            '#sampleProtocolField': {
                select: 'onSampleProtocolFieldSelect'
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
            if (wnd.mode == 'add') {
                wnd.setTitle('Add Sample');
                Ext.getCmp('sampleForm').reset();
            }
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

        this.initializeTooltips();

        // Load Library Protocols
        wnd.setLoading();
        Ext.getStore('libraryProtocolsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Library Protocols', 'error');

            if (wnd.mode == 'edit') {
                var libraryProtocolField = Ext.getCmp('libraryProtocolField');
                libraryProtocolField.select(record.libraryProtocolId);
                libraryProtocolField.fireEvent('select', libraryProtocolField, libraryProtocolField.findRecordByValue(record.libraryProtocolId), 'edit');
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
                indexType.fireEvent('select', indexType, indexType.findRecordByValue(record.indexTypeId), 'edit');
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

    onSampleCardActivate: function(card) {
        var wnd = card.up('library_wnd');

        Ext.getCmp('sampleProtocolInfo').hide();

        Ext.getCmp('addWndBtn').show();
        if (wnd.mode == 'add') {
            Ext.getCmp('saveAndAddWndBtn').show();
        } else {
            var record = wnd.record.data,
                form = Ext.getCmp('sampleForm').getForm();

            form.setValues({
                name: record.name,
                DNADissolvedIn: record.DNADissolvedIn,
                concentration: record.concentration,
                sampleVolume: record.sampleVolume,
                sampleAmplifiedCycles: record.amplifiedCycles,
                sequencingDepth: record.sequencingDepth,
                samplePreparationProtocol: record.samplePreparationProtocol,
                requestedSampleTreatment: record.requestedSampleTreatment,
                comments: record.comments
            });
            if (record.equalRepresentation == 'False') Ext.getCmp('equalRepresentationRadio4').setValue(true);
            if (record.DNaseTreatment == 'False') Ext.getCmp('DNaseTreatmentRadio2').setValue(true);
            if (record.rnaSpikeIn == 'False') Ext.getCmp('rnaSpikeInRadio2').setValue(true);

            Ext.getCmp('addWndBtn').setConfig('text', 'Save');
        }

        this.initializeTooltips();

        // Load Nucleic Acid Types
        wnd.setLoading();
        Ext.getStore('nucleicAcidTypesStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Nucleic Acid Types', 'error');

            if (wnd.mode == 'edit') {
                var nucleicAcidTypeField = Ext.getCmp('nucleicAcidTypeField');
                nucleicAcidTypeField.select(record.nucleicAcidTypeId);
                nucleicAcidTypeField.fireEvent('select', nucleicAcidTypeField, nucleicAcidTypeField.findRecordByValue(record.nucleicAcidTypeId), 'edit');
            }

            wnd.setLoading(false);
        });

        // Load Organisms
        wnd.setLoading();
        Ext.getStore('organismsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Organisms', 'error');

            if (wnd.mode == 'edit') {
                var organismSampleField = Ext.getCmp('organismSampleField');
                organismSampleField.select(record.organismId);
                organismSampleField.fireEvent('select', organismSampleField, organismSampleField.findRecordByValue(record.organismId));
            }

            wnd.setLoading(false);
        });

        // Load Concentration Methods
        wnd.setLoading();
        Ext.getStore('concentrationMethodsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');

            if (wnd.mode == 'edit') {
                var concentrationSampleMethodField = Ext.getCmp('concentrationSampleMethodField');
                concentrationSampleMethodField.select(record.concentrationMethodId);
                concentrationSampleMethodField.fireEvent('select', concentrationSampleMethodField, concentrationSampleMethodField.findRecordByValue(record.concentrationMethodId));
            }

            wnd.setLoading(false);
        });

        // Load RNA Qualities
        Ext.getStore('rnaQualityStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load RNA Qualities', 'error');

            if (wnd.mode == 'edit') {
                var rnaQualityField = Ext.getCmp('rnaQualityField');
                rnaQualityField.select(record.rnaQualityId);
                rnaQualityField.fireEvent('select', rnaQualityField, rnaQualityField.findRecordByValue(record.rnaQualityId));
            }

            wnd.setLoading(false);
        });

        // Load Sequencing Run Conditions
        wnd.setLoading();
        Ext.getStore('sequencingRunConditionsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Sequencing Run Conditions', 'error');

            if (wnd.mode == 'edit') {
                var sequencingRunConditionSampleField = Ext.getCmp('sequencingRunConditionSampleField');
                sequencingRunConditionSampleField.select(record.sequencingRunConditionId);
                sequencingRunConditionSampleField.fireEvent('select', sequencingRunConditionSampleField, sequencingRunConditionSampleField.findRecordByValue(record.sequencingRunConditionId));
            }

            wnd.setLoading(false);
        });
    },

    onLibraryProtocolFieldSelect: function(fld, record, eOpts) {
        var wnd = fld.up('library_wnd'),
            libraryTypeStore = Ext.getStore('libraryTypeStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField');

        libraryTypeField.reset();

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

                    if (wnd.mode == 'edit' && eOpts == 'edit') {
                        var record = wnd.record.data;
                        libraryTypeField.select(record.libraryTypeId);
                        libraryTypeField.fireEvent('select', libraryTypeField, libraryTypeField.findRecordByValue(record.libraryTypeId));
                    }
                }
                wnd.setLoading(false);
            }
        });
    },

    onIndexTypeSelect: function(fld, record, eOpts) {
        var wnd = fld.up('library_wnd'),
            indexReadsField = Ext.getCmp('indexReadsField'),
            indexI7Store = Ext.getStore('indexI7Store'),
            indexI5Store = Ext.getStore('indexI5Store'),
            indexI7Field = Ext.getCmp('indexI7Field'),
            indexI5Field = Ext.getCmp('indexI5Field');

        indexReadsField.reset();
        indexReadsField.enable();
        indexI7Field.disable();
        indexI5Field.disable();

        if (record.data.id == 1 || record.data.id == 2) {
            // TruSeq small RNA (I7, RPI1-RPI48) or TruSeq DNA/RNA (I7, A001 - A027):
            // # of index reads: 0,1
            indexReadsField.getStore().setData( [{id: 1, name: 0}, {id: 2, name: 1}] );
        } else {
            // Nextera (I7, N701-N712; I5 S501-S517):
            // # of index reads: 0,1,2
            indexReadsField.getStore().setData( [{id: 1, name: 0}, {id: 2, name: 1}, {id: 3, name: 2}] );
        }

        if (wnd.mode == 'edit' && eOpts == 'edit') {
            var wndRecord = wnd.record.data;
            indexReadsField.select(wndRecord.indexReads);
            indexReadsField.fireEvent('select', indexReadsField, indexReadsField.findRecordByValue(wndRecord.indexReads));
        }

        // Remove values before loading new stores
        indexI7Field.reset();
        indexI5Field.reset();

        // Load Index I7
        wnd.setLoading();
        indexI7Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I7', 'error');
                if (wnd.mode == 'edit' && eOpts == 'edit') indexI7Field.setValue(wndRecord.indexI7);
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
                if (wnd.mode == 'edit' && eOpts == 'edit') indexI5Field.setValue(wndRecord.indexI5);
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

    onNucleicAcidTypeFieldSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            sampleProtocolField = Ext.getCmp('sampleProtocolField'),
            DNaseTreatmentField = Ext.getCmp('DNaseTreatmentField'),
            rnaQualityField = Ext.getCmp('rnaQualityField'),
            rnaSpikeInField = Ext.getCmp('rnaSpikeInField');

        if (record.data.type == 'RNA') {
            DNaseTreatmentField.setDisabled(false);
            rnaQualityField.setDisabled(false);
            rnaSpikeInField.setDisabled(false);
        } else {
            DNaseTreatmentField.setDisabled(true);
            rnaQualityField.setDisabled(true);
            rnaSpikeInField.setDisabled(true);
        }

        // Load Sample Protocols
        wnd.setLoading();
        Ext.getStore('sampleProtocolsStore').load({
            params: {
                'type': record.data.type
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Sample Protocols', 'error');
                } else {
                    sampleProtocolField.setDisabled(false);
                }

                if (wnd.mode == 'edit') {
                    var sampleProtocolId = wnd.record.data.libraryProtocolId;
                    sampleProtocolField.select(sampleProtocolId);
                    sampleProtocolField.fireEvent('select', sampleProtocolField, sampleProtocolField.findRecordByValue(sampleProtocolId), 'edit');
                }

                wnd.setLoading(false);
            }
        });
    },

    onSampleProtocolFieldSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            sampleProtocolInfo = Ext.getCmp('sampleProtocolInfo');

        if (record && record.get('name') != 'Other') {
            sampleProtocolInfo.show();
            sampleProtocolInfo.setHtml(
                '<strong>Provider, Catalog: </strong>' + record.get('provider') + ', ' + record.get('catalog') + '<br>' +
                '<strong>Explanation: </strong>' + record.get('explanation') + '<br>' +
                '<strong>Input Requirements: </strong>' + record.get('inputRequirements') + '<br>' +
                '<strong>Typical Application: </strong>' + record.get('typicalApplication') + '<br>' +
                '<strong>Comments: </strong>' + record.get('comments')
            );
        } else {
            sampleProtocolInfo.hide();
        }
    },

    onSaveAndAddWndBtnClick: function() {
        this.saveLibrary(true);
    },

    onAddWndBtnClick: function() {
        this.saveLibrary();
    },

    initializeTooltips: function () {
        $.each($('.field-tooltip'), function(idx, item) {
            Ext.create('Ext.tip.ToolTip', {
                title: 'Help',
                target: item,
                html: $(item).attr('tooltip-text'),
                dismissDelay: 15000,
                maxWidth: 300
            });
        });
    },

    saveLibrary: function(addAnother) {
        var form = null, data = null, wnd = Ext.getCmp('library_wnd'),
            card = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id;
        addAnother = addAnother || false;

        if (card == 'libraryCard') {
            form = Ext.getCmp('libraryForm');
            data = form.getForm().getFieldValues();

            if (form.isValid()) {
                wnd.setLoading('Adding...');
                Ext.Ajax.request({
                    url: 'save_library/',
                    timeout: 1000000,
                    scope: this,

                    params: {
                        'mode': wnd.mode,
                        'name': data.name,
                        'library_id': (typeof wnd.record !== 'undefined') ? wnd.record.data.libraryId : '',
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

        } else {
            form = Ext.getCmp('sampleForm');
            data = form.getForm().getFieldValues();

            if (form.isValid()) {
                wnd.setLoading('Adding...');

                Ext.Ajax.request({
                    url: 'save_sample/',
                    timeout: 1000000,
                    scope: this,

                    params: {
                        'mode': wnd.mode,
                        'name': data.name,
                        'sample_id': (typeof wnd.record !== 'undefined') ? wnd.record.data.sampleId : '',
                        'nucleic_acid_type_id': data.nucleicAcidType,
                        'sample_protocol_id': data.sampleProtocol,
                        // 'library_type_id': data.libraryType,
                        'organism_id': data.organism,
                        'equal_representation_nucleotides': data.equalRepresentationOfNucleotides,
                        'dna_dissolved_in': data.DNADissolvedIn,
                        'concentration': data.concentration,
                        'concentration_determined_by_id': data.concentrationDeterminedBy,
                        'sample_volume': data.sampleVolume,
                        'sample_amplified_cycles': data.sampleAmplifiedCycles,
                        'dnase_treatment': data.DNaseTreatment,
                        'rna_quality_id': data.rnaQuality,
                        'rna_spike_in': data.rnaSpikeIn,
                        'sample_preparation_protocol': data.samplePreparationProtocol,
                        'requested_sample_treatment': data.requestedSampleTreatment,
                        'sequencing_run_condition_id': data.sequencingRunCondition,
                        'sequencing_depth': data.sequencingDepth,
                        'comments': data.comments
                    },

                    success: function (response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        if (obj.success) {
                            var grid = Ext.getCmp('librariesTable');
                            grid.fireEvent('refresh', grid);

                            if (wnd.mode == 'add') {
                                Ext.ux.ToastMessage('Sample has been added!');
                            } else {
                                Ext.ux.ToastMessage('Sample has been updated!');
                            }

                            // Preserve all fields except for Name, if 'Save and Add another' button was pressed
                            if (addAnother) {
                                Ext.getCmp('sampleName').reset();
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
                            console.log('[ERROR]: save_sample(): ' + obj.error);
                            console.log(response);
                            wnd.setLoading(false);
                        }
                    },

                    failure: function (response) {
                        Ext.ux.ToastMessage(response.statusText, 'error');
                        console.log('[ERROR]: save_sample()');
                        console.log(response);
                        wnd.close();
                    }
                });
            } else {
                Ext.ux.ToastMessage('Check the form', 'warning');
            }
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('library_wnd').close();
    }
});
