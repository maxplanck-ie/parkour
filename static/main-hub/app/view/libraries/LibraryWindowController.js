Ext.define('MainHub.view.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-librarywindow',

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
            // '#saveAndAddWndBtn': {
            //     click: 'onSaveAndAddWndBtnClick'
            // },
            '#keepAndAddWndBtn': {
                click: 'onKeepAndAddWndBtnClick'
            },
            '#addWndBtn': {
                click: 'onAddWndBtnClick'
            },
            '#loadFromFileBtn': {
                click: 'onLoadFromFileBtnClick'
            },
            '#loadSamplesFromFile': {
                selectionchange: 'onLoadSamplesFromFileSelection'
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
        wnd.justLoaded = true;
    },

    onCardBtnClick: function(btn) {
        var wnd = btn.up('library_wnd'),
            layout = btn.up('panel').getLayout();

        if (wnd.mode == 'add') {
            wnd.setSize(885, 700);
        } else {
            wnd.setSize(635, 700);
        }

        wnd.center();
        wnd.getDockedItems('toolbar[dock="bottom"]')[0].show();

        if (btn.itemId == 'libraryCardBtn') {
            layout.setActiveItem(1);
            if (wnd.mode == 'add') {
                wnd.setTitle('Add Library');
                Ext.getCmp('libraryName').reset();
            }
        } else {
            layout.setActiveItem(2);
            if (wnd.mode == 'add') {
                wnd.setTitle('Add Sample');
                Ext.getCmp('sampleName').reset();
            }
        }
    },

    onLibraryCardActivate: function(card) {
        var wnd = card.up('library_wnd');

        Ext.getCmp('addWndBtn').show();
        if (wnd.mode == 'add') {
            Ext.getStore('fileSampleStore').removeAll();
            Ext.getCmp('saveAndAddWndBtn').show();
        } else {
            var record = wnd.record.data,
                form = Ext.getCmp('libraryForm').getForm();

            // Show Library barcode
            Ext.getCmp('libraryBarcodeField').show().setHtml(record.barcode);

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
            if (record.files.length > 0) {
                Ext.getStore('fileLibraryStore').load({
                    params: {
                        'file_ids': Ext.JSON.encode(record.files)
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load Sample files', 'error');
                    }
                });
            }

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
        var wnd = card.up('library_wnd'), form = null, record = null;

        Ext.getCmp('addWndBtn').show();
        Ext.getCmp('sampleProtocolInfo').hide();
        this.initializeTooltips();

        if (wnd.mode == 'add') {
            Ext.getStore('fileSampleStore').removeAll();
            Ext.getCmp('loadSamplesFromFile').show();
            Ext.getCmp('loadFromFileBtn').show();
            Ext.getCmp('downloadFileTemplate').show();
            // Ext.getCmp('saveAndAddWndBtn').show();
            Ext.getCmp('keepAndAddWndBtn').show();
            Ext.getCmp('loadSamplesFromFile').setStore(
                Ext.create('Ext.data.Store', {
                    model: 'MainHub.model.libraries.Library',
                    data: []
                })
            );
        } else {
            form = Ext.getCmp('sampleForm').getForm();
            record = wnd.record.data;
            
            // Show Sample barcode
            Ext.getCmp('sampleBarcodeField').show().setHtml(record.barcode);

            Ext.getCmp('addWndBtn').setConfig('text', 'Save');
        }

        // Load Nucleic Acid Types
        Ext.getStore('nucleicAcidTypesStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Nucleic Acid Types', 'error');
        });

        // Load Organisms
        Ext.getStore('organismsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Organisms', 'error');
        });

        // Load RNA Qualities
        Ext.getStore('rnaQualityStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load RNA Qualities', 'error');
        });

        // Load Sequencing Run Conditions
        Ext.getStore('sequencingRunConditionsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Sequencing Run Conditions', 'error');
        });

        // Load Concentration Methods
        Ext.getStore('concentrationMethodsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');
        });

        this.setSampleForm(wnd, form, record);
    },

    onLibraryProtocolFieldSelect: function(fld, record, eOpts) {
        var wnd = fld.up('library_wnd'),
            libraryTypeStore = Ext.getStore('libraryTypeStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField');

        libraryTypeField.reset();

        // Load Library Type
        // wnd.setLoading();
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
                // wnd.setLoading(false);
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
        // wnd.setLoading();
        indexI7Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I7', 'error');
                if (wnd.mode == 'edit' && eOpts == 'edit') indexI7Field.setValue(wndRecord.indexI7);
                // wnd.setLoading(false);
            }
        });

        // Load Index I5
        // wnd.setLoading();
        indexI5Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load Index I5', 'error');
                if (wnd.mode == 'edit' && eOpts == 'edit') indexI5Field.setValue(wndRecord.indexI5);
                // wnd.setLoading(false);
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
        // wnd.setLoading();
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

                sampleProtocolField.clearValue();

                var sampleProtocolId = null;
                if (wnd.mode == 'edit' && wnd.justLoaded) {
                    wnd.justLoaded = false;
                    sampleProtocolId = wnd.record.data.libraryProtocolId;
                    sampleProtocolField.select(sampleProtocolId);
                    sampleProtocolField.fireEvent('select', sampleProtocolField, sampleProtocolField.findRecordByValue(sampleProtocolId), 'edit');
                } else if (wnd.mode == 'add' && typeof wnd.selectionChange != 'undefined' && wnd.selectionChange) {
                    var grid = Ext.getCmp('loadSamplesFromFile');
                    sampleProtocolId = grid.getSelectionModel().getSelection()[0].data.sampleProtocolId;
                    sampleProtocolField.select(sampleProtocolId);
                    sampleProtocolField.fireEvent('select', sampleProtocolField, sampleProtocolField.findRecordByValue(sampleProtocolId), 'edit');
                }

                // wnd.setLoading(false);
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

    onKeepAndAddWndBtnClick: function() {
        // For Samples only (yet)
        var wnd = Ext.getCmp('library_wnd'),
            form = Ext.getCmp('sampleForm'),
            data = form.getForm().getFieldValues(),
            files = form.down('filegridfield').getValue(),
            grid = Ext.getCmp('loadSamplesFromFile'),
            sampleName = Ext.getCmp('sampleName').getValue(),
            samplesInGrid = Ext.Array.pluck(Ext.Array.pluck(grid.getStore().data.items, 'data'), 'name');

        if (form.isValid() && samplesInGrid.indexOf(sampleName) == -1) {
            var record = this.getSampleRecord(data, files),
                samplesGrid = Ext.getCmp('loadSamplesFromFile');
            
            if (samplesGrid.isDisabled()) samplesGrid.enable();
            
            samplesGrid.getStore().add(record);
            Ext.getCmp('sampleName').reset();
            Ext.getStore('fileSampleStore').removeAll();
        } else if (samplesInGrid.indexOf(sampleName) > -1) {
            Ext.ux.ToastMessage('Sample Name must be unique', 'warning');
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
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
        var me = this,
            form = null,
            grid = null,
            url = '',
            data = {},
            params = {},
            records = [],
            nameFieldName = '',
            fileStoreName = '',
            wnd = Ext.getCmp('library_wnd'), 
            card = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id;
        addAnother = addAnother || false;

        if (card == 'libraryCard') {
            form = Ext.getCmp('libraryForm');
            data = form.getForm().getFieldValues();
            url = 'save_library/';
            nameFieldName = 'libraryName';
            fileStoreName = 'fileLibraryStore';
            params = {
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
                'comments': data.comments,
                'files': Ext.JSON.encode(form.down('filegridfield').getValue())
            };
        } 
        else {
            form = Ext.getCmp('sampleForm');
            grid = Ext.getCmp('loadSamplesFromFile');
            records = grid.getStore().data.items;
            data = form.getForm().getFieldValues();
            url = 'save_sample/';
            // nameFieldName = 'sampleName';
            // fileStoreName = 'fileSampleStore';

            params = {'forms': []};
            if (records.length == 0) {
                params.forms.push(me.prepareSampleParams(wnd, data, form.down('filegridfield').getValue(), false));
            } else {
                Ext.Array.each(records, function(record) {
                    params.forms.push(me.prepareSampleParams(wnd, record.data, record.get('files'), true));
                });
            }
            params.forms = Ext.JSON.encode(params.forms);
        }

        // data = form.getForm().getFieldValues();

        var condition = false;
        if (grid != null && records.length == 0 && form.isValid()) {
            condition = true;
        } else if (grid != null && records.length > 0) {
            condition = true;
        }

        if (condition) {
            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: url,
                method: 'POST',
                timeout: 1000000,
                scope: this,
                params: params,

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText), grid = null;

                    if (obj.success) {
                        if (wnd.mode == 'add') {
                            Ext.ux.ToastMessage('Record has been added!');
                            grid = Ext.getCmp('librariesInRequestTable');
                            grid.getStore().add(obj.data);
                        } else {
                            Ext.ux.ToastMessage('Record has been updated!');
                            grid = Ext.getCmp('librariesTable');
                            grid.fireEvent('refresh', grid);
                        }
                        wnd.close();
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: ' + url + ': ' + obj.error);
                        console.error(response);
                        wnd.setLoading(false);
                    }
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: ' + url);
                    console.error(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onLoadFromFileBtnClick: function(btn) {
        Ext.create('Ext.ux.FileUploadWindow', {
            onFileUpload: function() {
                var me = this,
                    form = this.down('form').getForm(),
                    url = 'load_samples_from_file/';

                if (form.isValid()) {
                    form.submit({
                        url: url,
                        method: 'POST',
                        waitMsg: 'Uploading...',
                        params: Ext.JSON.encode(form.getFieldValues()),
                        
                        success: function(f, action) {
                            var obj = Ext.JSON.decode(action.response.responseText);

                            if (obj.success) {
                                var grid = Ext.getCmp('loadSamplesFromFile'),
                                    store = grid.getStore();
                                store.add(obj.data);
                                grid.enable();
                                me.close();
                            } else {
                                Ext.ux.ToastMessage('There is a problem with the provided file', 'error');
                                // print to the console
                            }
                        },

                        failure: function(response) {
                            console.error('[ERROR]: ' + url);
                            console.error(response);
                        }
                    });
                } else {
                    Ext.ux.ToastMessage('You did not select any file', 'warning');
                }
            }
        });
    },

    onLoadSamplesFromFileSelection: function(view, selection) {
        var wnd = Ext.getCmp('library_wnd'),
            form = Ext.getCmp('sampleForm').getForm(),
            record = selection[0].data;
        form.reset();
        this.setSampleForm(wnd, form, record);
        wnd.selectionChange = true;
    },

    onCancelBtnClick: function(btn) {
        btn.up('library_wnd').close();
    },

    getSampleRecord: function(data, files) {
        return {
            'name': data.name,
            'nucleicAcidTypeId': data.nucleicAcidType,
            'sampleProtocolId': data.sampleProtocol,
            'organismId': data.organism,
            'equalRepresentationOfNucleotides': data.equalRepresentationOfNucleotides,
            'DNADissolvedIn': data.DNADissolvedIn,
            'concentration': data.concentration,
            'concentrationMethodId': data.concentrationDeterminedBy,
            'sampleVolume': data.sampleVolume,
            'sampleAmplifiedCycles': data.sampleAmplifiedCycles,
            'DNaseTreatment': data.DNaseTreatment,
            'rnaQualityId': data.rnaQuality,
            'rnaSpikeIn': data.rnaSpikeIn,
            'samplePreparationProtocol': data.samplePreparationProtocol,
            'requestedSampleTreatment': data.requestedSampleTreatment,
            'sequencingRunConditionId': data.sequencingRunCondition,
            'sequencingDepth': data.sequencingDepth,
            'comments': data.comments,
            'files': files
        }
    },

    prepareSampleParams: function(wnd, data, files, multiple) {
        return {
            'mode': wnd.mode,
            'name': data.name,
            'sample_id': (typeof wnd.record !== 'undefined') ? wnd.record.data.sampleId : '',
            'nucleic_acid_type': multiple ? data.nucleicAcidTypeId : data.nucleicAcidType,
            'sample_protocol': multiple ? data.sampleProtocolId : data.sampleProtocol,
            // 'library_type_id': data.libraryType,
            'organism': multiple ? data.organismId : data.organism,
            'equal_representation_nucleotides': data.equalRepresentationOfNucleotides,
            'dna_dissolved_in': data.DNADissolvedIn,
            'concentration': data.concentration,
            'concentration_determined_by': multiple ? data.concentrationMethodId : data.concentrationDeterminedBy,
            'sample_volume': data.sampleVolume,
            'sample_amplified_cycles': data.sampleAmplifiedCycles,
            'dnase_treatment': data.DNaseTreatment,
            'rna_quality': multiple ? (data.rnaQualityId == 0 ? null : data.rnaQualityId) : data.rnaQuality,
            'rna_spike_in': data.rnaSpikeIn,
            'sample_preparation_protocol': data.samplePreparationProtocol,
            'requested_sample_treatment': data.requestedSampleTreatment,
            'sequencing_run_condition': multiple ? data.sequencingRunConditionId : data.sequencingRunCondition,
            'sequencing_depth': data.sequencingDepth,
            'comments': data.comments,
            // 'files': Ext.JSON.encode(form.down('filegridfield').getValue())
            'files': files
        }
    },

    setSampleForm: function(wnd, form, record) {
        if (wnd.mode == 'edit' || form != null) {
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
            if (record.files.length > 0) {
                Ext.getStore('fileSampleStore').load({
                    params: {
                        'file_ids': Ext.JSON.encode(record.files)
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load Sample files', 'error');
                    }
                });
            }
        }

        if (wnd.mode == 'edit' || record != null) {
            var nucleicAcidTypeField = Ext.getCmp('nucleicAcidTypeField');
            nucleicAcidTypeField.select(record.nucleicAcidTypeId);
            nucleicAcidTypeField.fireEvent('select', nucleicAcidTypeField, nucleicAcidTypeField.findRecordByValue(record.nucleicAcidTypeId), 'edit');

            var organismSampleField = Ext.getCmp('organismSampleField');
            organismSampleField.select(record.organismId);
            organismSampleField.fireEvent('select', organismSampleField, organismSampleField.findRecordByValue(record.organismId));
        
            var concentrationSampleMethodField = Ext.getCmp('concentrationSampleMethodField');
            concentrationSampleMethodField.select(record.concentrationMethodId);
            concentrationSampleMethodField.fireEvent('select', concentrationSampleMethodField, concentrationSampleMethodField.findRecordByValue(record.concentrationMethodId));

            var rnaQualityField = Ext.getCmp('rnaQualityField');
            rnaQualityField.select(record.rnaQualityId);
            rnaQualityField.fireEvent('select', rnaQualityField, rnaQualityField.findRecordByValue(record.rnaQualityId));

            var sequencingRunConditionSampleField = Ext.getCmp('sequencingRunConditionSampleField');
            sequencingRunConditionSampleField.select(record.sequencingRunConditionId);
            sequencingRunConditionSampleField.fireEvent('select', sequencingRunConditionSampleField, sequencingRunConditionSampleField.findRecordByValue(record.sequencingRunConditionId));
        }
    }
});
