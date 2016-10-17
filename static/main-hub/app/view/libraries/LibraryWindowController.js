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
            '#sampleCard': {
                activate: 'onSampleCardActivate'
            },

            // Library Fields
            '#libraryProtocolField': {
                select: 'onLibraryProtocolFieldSelect'
            },
            '#indexType': {
                select: 'onIndexTypeSelect'
            },
            '#indexReadsField': {
                select: 'onIndexReadsFieldSelect'
            },
            '#loadLibrariesFromFile': {
                selectionchange: 'onLoadFromFileSelection'
            },

            // Sample Fields
            '#nucleicAcidTypeField': {
                select: 'onNucleicAcidTypeFieldSelect'
            },
            '#sampleProtocolField': {
                select: 'onSampleProtocolFieldSelect'
            },

            'textfield': {
                change: 'onTextfieldChange'
            },

            'radiofield': {
                change: 'onRadiofieldChange'
            },
            '#loadSamplesFromFile': {
                selectionchange: 'onLoadFromFileSelection'
            },

            // Buttons
            '#keepAndAddWndBtn': {
                click: 'onKeepAndAddWndBtnClick'
            },
            '#addWndBtn': {
                click: 'onAddWndBtnClick'
            },
            '#loadFromFileBtn': {
                click: 'onLoadFromFileBtnClick'
            }
        }
    },

    onLibraryWindowBoxready: function (wnd) {
        // Bypass Selection (Library/Sample) dialog if editing
        if (wnd.mode == 'edit') {
            wnd.justLoaded = true;
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

        this.initializeTooltips();

        if (wnd.mode == 'add') {
            Ext.getStore('fileLibraryStore').removeAll();
            Ext.getCmp('loadLibrariesFromFile').show();
            Ext.getCmp('loadFromFileBtn').show();
            Ext.getCmp('keepAndAddWndBtn').show();
            Ext.getCmp('loadLibrariesFromFile').setStore(
                Ext.create('Ext.data.Store', {
                    model: 'MainHub.model.libraries.Library',
                    data: []
                })
            );
        } else {
            var form = Ext.getCmp('libraryForm').getForm(),
                record = wnd.record.data;

            // Show Library barcode
            Ext.getCmp('libraryBarcodeField').show().setHtml(record.barcode);

            Ext.getCmp('addWndBtn').setConfig('text', 'Save');

            this.setLibraryForm(wnd, form, record);
        }
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

            this.setSampleForm(wnd, form, record);
        }
    },

    onLibraryProtocolFieldSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            libraryTypeStore = Ext.getStore('libraryTypeStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField');

        libraryTypeField.reset();

        // Load Library Type
        libraryTypeStore.load({
            params: {
                'library_protocol_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Principal Investigators', 'error');
                } else {
                    libraryTypeField.setDisabled(false);

                    var selectionChange = typeof wnd.selectionChange != 'undefined' && wnd.selectionChange,
                        libraryType = null;

                    if (selectionChange) {
                        var grid = Ext.getCmp('loadLibrariesFromFile');
                        libraryType = grid.getSelectionModel().getSelection()[0].data.libraryType;
                    }
                    libraryTypeField.clearValue();

                    // Set Library Type
                    // if (wnd.mode == 'edit' && wnd.justLoaded) {
                    if (wnd.mode == 'edit') {
                        // wnd.justLoaded = false;
                        libraryType = wnd.record.data.libraryType;
                        libraryTypeField.select(libraryType);
                        libraryTypeField.fireEvent('select', libraryTypeField, libraryTypeField.findRecordByValue(libraryType));
                    } else if (wnd.mode == 'add' && selectionChange) {
                        libraryTypeField.select(libraryType);
                        libraryTypeField.fireEvent('select', libraryTypeField, libraryTypeField.findRecordByValue(libraryType));
                    }
                }
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

        var selectionChange = typeof wnd.selectionChange != 'undefined' && wnd.selectionChange,
            indexReads = null;

        if (selectionChange) {
            var grid = Ext.getCmp('loadLibrariesFromFile'),
                data = grid.getSelectionModel().getSelection()[0].data;
            indexReads = data.indexReads;
        }
        indexReadsField.clearValue();

        // Set Index Reads
        // if (wnd.mode == 'edit' && wnd.justLoaded) {
        if (wnd.mode == 'edit') {
            // wnd.justLoaded = false;
            indexReads = wnd.record.data.indexReads;
            indexReadsField.select(indexReads);
            indexReadsField.fireEvent('select', indexReadsField, indexReadsField.findRecordByValue(indexReads));
        } else if (wnd.mode == 'add' && selectionChange) {
            indexReadsField.select(indexReads);
            indexReadsField.fireEvent('select', indexReadsField, indexReadsField.findRecordByValue(indexReads));
        }

        // Clear fields before loading new stores
        indexI7Field.reset();
        indexI5Field.reset();

        // Load Index I7
        indexI7Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Index I7', 'error');
                } else {
                    if (wnd.mode == 'edit') {
                        indexI7Field.setValue(wnd.record.data.indexI7);
                    }
                    else if(wnd.mode == 'add' && selectionChange) {
                        indexI7Field.setValue(data.indexI7);
                    }
                }
            }
        });

        // Load Index I5
        indexI5Store.load({
            params: {
                'index_type_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Index I5', 'error');
                } else {
                    if (wnd.mode == 'edit') {
                        indexI5Field.setValue(wnd.record.data.indexI5);
                    }
                    else if(wnd.mode == 'add' && selectionChange) {
                        indexI5Field.setValue(data.indexI5);
                    }
                }
            }
        });
    },

    onIndexReadsFieldSelect: function(fld, record) {
        var indexI7Field = Ext.getCmp('indexI7Field'),
            indexI5Field = Ext.getCmp('indexI5Field');

        if (record.data.id == 1) {
            indexI7Field.setDisabled(true);
            indexI5Field.setDisabled(true);
            indexI7Field.reset();
            indexI5Field.reset();
        } else if (record.data.id == 2) {
            indexI7Field.setDisabled(false);
            indexI5Field.setDisabled(true);
            indexI5Field.reset();
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

                var selectionChange = typeof wnd.selectionChange != 'undefined' && wnd.selectionChange,
                    sampleProtocol = null;

                if (selectionChange) {
                    var grid = Ext.getCmp('loadSamplesFromFile');
                    sampleProtocol = grid.getSelectionModel().getSelection()[0].data.sampleProtocol;
                }
                sampleProtocolField.clearValue();

                // Set Sample Protocol
                if (wnd.mode == 'edit' && wnd.justLoaded) {
                    wnd.justLoaded = false;
                    sampleProtocol = wnd.record.data.libraryProtocol;
                    sampleProtocolField.select(sampleProtocol);
                    sampleProtocolField.fireEvent('select', sampleProtocolField, sampleProtocolField.findRecordByValue(sampleProtocol), 'edit');
                } else if (wnd.mode == 'add' && selectionChange) {
                    sampleProtocolField.select(sampleProtocol);
                    sampleProtocolField.fireEvent('select', sampleProtocolField, sampleProtocolField.findRecordByValue(sampleProtocol), 'edit');
                }
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

    onTextfieldChange: function(fld, newValue) {
        var wnd = Ext.getCmp('library_wnd'),
            type = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id,
            grid = null;

        if (type == 'libraryCard') {
            grid = Ext.getCmp('loadLibrariesFromFile');
        } else {
            grid = Ext.getCmp('loadSamplesFromFile');
        }

        var selection = grid.getSelectionModel().getSelection();

        if (typeof wnd.isSetting != 'undefined' && !wnd.isSetting && selection.length > 0) {
            selection[0].set(fld.name, newValue);
        }
    },

    onRadiofieldChange: function(fld, newValue) {
        var wnd = Ext.getCmp('library_wnd'),
            grid = Ext.getCmp('loadSamplesFromFile'),
            selection = grid.getSelectionModel().getSelection();

        if ((typeof wnd.isSetting != 'undefined' && !wnd.isSetting && selection.length > 0) &&
            (fld.id == 'equalRepresentationRadio1' || fld.id == 'equalRepresentationRadio3' ||
            fld.id == 'DNaseTreatmentRadio1' || fld.id == 'rnaSpikeInRadio1')) {
            selection[0].set(fld.name, newValue);
        }
    },

    onKeepAndAddWndBtnClick: function() {
        var wnd = Ext.getCmp('library_wnd'),
            type = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id,
            form = null,
            grid = null,
            filesStore = null,
            recordNameField = null;

        if (type == 'libraryCard') {
            form = Ext.getCmp('libraryForm');
            grid = Ext.getCmp('loadLibrariesFromFile');
            recordNameField = Ext.getCmp('libraryName');
            filesStore = Ext.getStore('fileLibraryStore');
        } else {
            form = Ext.getCmp('sampleForm');
            grid = Ext.getCmp('loadSamplesFromFile');
            recordNameField = Ext.getCmp('sampleName');
            filesStore = Ext.getStore('fileSampleStore');
        }

        var data = form.getForm().getFieldValues(),
            files = form.down('filegridfield').getValue(),
            recordName = recordNameField.getValue(),
            recordsInGrid = Ext.Array.pluck(Ext.Array.pluck(grid.getStore().data.items, 'data'), 'name');

        if (form.isValid() && recordsInGrid.indexOf(recordName) == -1) {
            var record = this.prepareRecord(data, files);

            if (grid.isDisabled()) {
                grid.enable();
            }

            grid.getStore().add(record);
            recordNameField.reset();
            filesStore.removeAll();
        } else if (recordsInGrid.indexOf(recordName) > -1) {
            Ext.ux.ToastMessage('Name must be unique', 'warning');
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

    saveLibrary: function() {
        var me = this,
            form = null,
            grid = null,
            url = '',
            data = {},
            records = [],
            nameFieldName = '',
            fileStoreName = '',
            wnd = Ext.getCmp('library_wnd'),
            card = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id;

        if (card == 'libraryCard') {
            var indexI7Field = Ext.getCmp('indexI7Field'),
                indexI5Field = Ext.getCmp('indexI5Field');
            form = Ext.getCmp('libraryForm');
            grid = Ext.getCmp('loadLibrariesFromFile');
            records = grid.getStore().data.items;
            data = form.getForm().getFieldValues();
            url = 'save_library/';

            if (indexI7Field.isDisabled()) {
                $.extend(data, {indexI7: ''});
            }

            if (indexI5Field.isDisabled()) {
                $.extend(data, {indexI5: ''});
            }
        }
        else {
            form = Ext.getCmp('sampleForm');
            grid = Ext.getCmp('loadSamplesFromFile');
            records = grid.getStore().data.items;
            data = form.getForm().getFieldValues();
            url = 'save_sample/';
        }

        var params = {'forms': []};
        if (records.length === 0) {
            params.forms.push(me.prepareParams(wnd, data, form.down('filegridfield').getValue()));
        } else {
            Ext.Array.each(records, function(record) {
                params.forms.push(me.prepareParams(wnd, record.data, record.get('files')));
            });
        }
        params.forms = Ext.JSON.encode(params.forms);

        var condition = false;
        if (grid !== null && records.length === 0 && form.isValid()) {
            condition = true;
        } else if (grid !== null && records.length > 0) {
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
                            grid = Ext.getCmp('librariesInRequestTable');
                            grid.getStore().add(obj.data);
                            Ext.ux.ToastMessage('Record has been added!');
                        } else {
                            Ext.getStore('requestsStore').reload();
                            Ext.getStore('librariesStore').reload();
                            Ext.getStore('librariesInRequestStore').reload({
                                params: {
                                    request_id: wnd.record.get('requestId')
                                }
                            });
                            Ext.ux.ToastMessage('Record has been updated!');
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
            buttons: [
                {
                    text: 'Download File Template',
                    handler: function() {}
                },
                '->',
                {
                    text: 'Upload',
                    handler: function() {
                        this.up('window').onFileUpload();
                    }
                },
                {
                    text: 'Cancel',
                    handler: function () {
                        this.up('window').close();
                    }
                }
            ],

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

    onLoadFromFileSelection: function(view, selection) {
        var wnd = Ext.getCmp('library_wnd'),
            type = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id,
            record = selection[0].data,
            form = null;

        wnd.isSetting = true;
        wnd.selectionChange = true;

        if (type == 'libraryCard') {
            form = Ext.getCmp('libraryForm').getForm();
            form.reset();
            this.setLibraryForm(wnd, form, record);
        } else {
            form = Ext.getCmp('sampleForm').getForm();
            form.reset();
            this.setSampleForm(wnd, form, record);
        }

        wnd.isSetting = false;
    },

    prepareRecord: function(data, files) {
        var type = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id,
            result = {};

        var common = {
            name                                :   data.name,
            organism                            :   data.organism,
            equalRepresentationOfNucleotides    :   data.equalRepresentationOfNucleotides,
            DNADissolvedIn                      :   data.DNADissolvedIn,
            concentration                       :   data.concentration,
            concentrationDeterminedBy           :   data.concentrationDeterminedBy,
            sampleVolume                        :   data.sampleVolume,
            sequencingRunCondition              :   data.sequencingRunCondition,
            sequencingDepth                     :   data.sequencingDepth,
            comments                            :   data.comments,
            files                               :   files
        };

        if (type == 'libraryCard') {
            result = $.extend(common, {
                libraryProtocol             :   data.libraryProtocol,
                libraryType                 :   data.libraryType,
                enrichmentCycles            :   data.enrichmentCycles,
                indexType                   :   data.indexType,
                indexReads                  :   data.indexReads,
                indexI7                     :   data.indexI7,
                indexI5                     :   data.indexI5,
                meanFragmentSize            :   data.meanFragmentSize,
                qPCRResult                  :   data.qPCRResult
            });
        } else {
            result = $.extend(common, {
                nucleicAcidType             :   data.nucleicAcidType,
                sampleProtocol              :   data.sampleProtocol,
                amplifiedCycles             :   data.amplifiedCycles,
                DNaseTreatment              :   data.DNaseTreatment,
                rnaQuality                  :   data.rnaQuality,
                rnaSpikeIn                  :   data.rnaSpikeIn,
                samplePreparationProtocol   :   data.samplePreparationProtocol,
                requestedSampleTreatment    :   data.requestedSampleTreatment
            });
        }

        return result;
    },

    prepareParams(wnd, data, files) {
        var type = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id,
            result = {};

        var common = {
            mode                                :   wnd.mode,
            name                                :   data.name,
            organism                            :   data.organism,
            equal_representation_nucleotides    :   data.equalRepresentationOfNucleotides,
            dna_dissolved_in                    :   data.DNADissolvedIn,
            concentration                       :   data.concentration,
            concentration_determined_by         :   data.concentrationDeterminedBy,
            sample_volume                       :   data.sampleVolume,
            sequencing_run_condition            :   data.sequencingRunCondition,
            sequencing_depth                    :   data.sequencingDepth,
            comments                            :   data.comments,
            // 'files': Ext.JSON.encode(form.down('filegridfield').getValue())
            files                               :   files
        };

        if (type == 'libraryCard') {
            result = $.extend(common, {
                library_id                      :   (typeof wnd.record !== 'undefined') ? wnd.record.data.libraryId : '',
                library_protocol                :   data.libraryProtocol,
                library_type                    :   data.libraryType,
                enrichment_cycles               :   data.enrichmentCycles,
                index_type                      :   data.indexType,
                index_reads                     :   data.indexReads,
                index_i7                        :   data.indexI7,
                index_i5                        :   data.indexI5,
                mean_fragment_size              :   data.meanFragmentSize,
                qpcr_result                     :   data.qPCRResult,
            });
        } else {
            result = $.extend(common, {
                sample_id                       :   (typeof wnd.record !== 'undefined') ? wnd.record.data.sampleId : '',
                nucleic_acid_type               :   data.nucleicAcidType,
                sample_protocol                 :   data.sampleProtocol,
                // 'library_type_id': data.libraryType,
                sample_amplified_cycles         :   data.amplifiedCycles,
                dnase_treatment                 :   data.DNaseTreatment,
                rna_quality                     :   (data.rnaQuality === 0) ? null : data.rnaQuality,
                rna_spike_in                    :   data.rnaSpikeIn,
                sample_preparation_protocol     :   data.samplePreparationProtocol,
                requested_sample_treatment      :   data.requestedSampleTreatment
            });
        }

        return result;
    },

    setLibraryForm: function(wnd, form, record) {
        if (form !== null) {
            form.setValues(record);
            if (record.equalRepresentationOfNucleotides === false) Ext.getCmp('equalRepresentationRadio2').setValue(true);
            if (record.files.length > 0) {
                Ext.getStore('fileLibraryStore').load({
                    params: {
                        'file_ids': Ext.JSON.encode(record.files)
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load Library files', 'error');
                    }
                });
            } else {
                Ext.getStore('fileLibraryStore').removeAll();
            }
        }

        if (record !== null) {
            var libraryProtocolField = Ext.getCmp('libraryProtocolField');
            libraryProtocolField.select(record.libraryProtocol);
            libraryProtocolField.fireEvent('select', libraryProtocolField, libraryProtocolField.findRecordByValue(record.libraryProtocol));

            var indexType = Ext.getCmp('indexType');
            indexType.select(record.indexType);
            indexType.fireEvent('select', indexType, indexType.findRecordByValue(record.indexType));

            var organismField = Ext.getCmp('organismField');
            organismField.select(record.organism);
            organismField.fireEvent('select', organismField, organismField.findRecordByValue(record.organism));

            var concentrationMethodField = Ext.getCmp('concentrationMethodField');
            concentrationMethodField.select(record.concentrationDeterminedBy);
            concentrationMethodField.fireEvent('select', concentrationMethodField, concentrationMethodField.findRecordByValue(record.concentrationDeterminedBy));

            var sequencingRunConditionField = Ext.getCmp('sequencingRunConditionField');
            sequencingRunConditionField.select(record.sequencingRunCondition);
            sequencingRunConditionField.fireEvent('select', sequencingRunConditionField, sequencingRunConditionField.findRecordByValue(record.sequencingRunCondition));
        }
    },

    setSampleForm: function(wnd, form, record) {
        if (form !== null) {
            form.setValues(record);
            if (record.equalRepresentationOfNucleotides === false) Ext.getCmp('equalRepresentationRadio4').setValue(true);
            if (record.DNaseTreatment === false || record.DNaseTreatment == 'False') Ext.getCmp('DNaseTreatmentRadio2').setValue(true);
            if (record.rnaSpikeIn === false || record.rnaSpikeIn == 'False') Ext.getCmp('rnaSpikeInRadio2').setValue(true);
            if (record.files.length > 0) {
                Ext.getStore('fileSampleStore').load({
                    params: {
                        'file_ids': Ext.JSON.encode(record.files)
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load Sample files', 'error');
                    }
                });
            } else {
                Ext.getStore('fileSampleStore').removeAll();
            }
        }

        if (record !== null) {
            var nucleicAcidTypeField = Ext.getCmp('nucleicAcidTypeField');
            nucleicAcidTypeField.select(record.nucleicAcidType);
            nucleicAcidTypeField.fireEvent('select', nucleicAcidTypeField, nucleicAcidTypeField.findRecordByValue(record.nucleicAcidType), 'edit');

            var organismSampleField = Ext.getCmp('organismSampleField');
            organismSampleField.select(record.organism);
            organismSampleField.fireEvent('select', organismSampleField, organismSampleField.findRecordByValue(record.organism));

            var concentrationSampleMethodField = Ext.getCmp('concentrationSampleMethodField');
            concentrationSampleMethodField.select(record.concentrationDeterminedBy);
            concentrationSampleMethodField.fireEvent('select', concentrationSampleMethodField, concentrationSampleMethodField.findRecordByValue(record.concentrationDeterminedBy));

            var rnaQualityField = Ext.getCmp('rnaQualityField');
            rnaQualityField.select(record.rnaQuality);
            rnaQualityField.fireEvent('select', rnaQualityField, rnaQualityField.findRecordByValue(record.rnaQuality));

            var sequencingRunConditionSampleField = Ext.getCmp('sequencingRunConditionSampleField');
            sequencingRunConditionSampleField.select(record.sequencingRunCondition);
            sequencingRunConditionSampleField.fireEvent('select', sequencingRunConditionSampleField, sequencingRunConditionSampleField.findRecordByValue(record.sequencingRunCondition));
        }
    }
});
