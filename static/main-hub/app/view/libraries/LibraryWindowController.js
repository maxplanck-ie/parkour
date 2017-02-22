Ext.define('MainHub.view.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-librarywindow',

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
            '#libraryCard': {
                activate: 'showLibraryCard'
            },
            '#sampleCard': {
                activate: 'showSampleCard'
            },
            '#libraryProtocolField': {
                select: 'setLibraryType'
            },
            '#indexType': {
                select: 'setNumberOfIndexReads'
            },
            '#indexReadsField': {
                select: 'enableIndicesFields'
            },
            '#nucleicAcidTypeField': {
                select: 'setSampleProtocol'
            },
            '#sampleProtocolField': {
                select: 'setSampleType'
            },
            '#saveAndAddWndBtn': {
                click: 'saveAndAdd'
            },
            '#addWndBtn': {
                click: 'saveAndClose'
            }
        }
    },

    boxready: function(wnd) {
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

    selectCard: function(btn) {
        var wnd = btn.up('window'),
            layout = btn.up('panel').getLayout();

        wnd.setSize(670, 700);
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

    showLibraryCard: function(card) {
        var wnd = card.up('window');

        Ext.getCmp('libraryProtocolInfo').hide();
        Ext.getCmp('addWndBtn').show();
        Ext.getStore('libraryProtocolsStore').reload();

        if (wnd.mode == 'add') {
            Ext.getStore('fileSampleStore').removeAll();
            Ext.getCmp('saveAndAddWndBtn').show();
        }

        else {
            var record = wnd.record.data,
                form = Ext.getCmp('libraryForm').getForm();

            // Show Library barcode
            Ext.getCmp('libraryBarcodeField').show().setHtml(record.barcode);

            // Set field values
            form.setValues(record);

            if (record.equalRepresentation == 'No') Ext.getCmp('equalRepresentationRadio2').setValue(true);
            if (record.files.length > 0) {
                Ext.getStore('fileLibraryStore').load({
                    params: {
                        'file_ids': Ext.JSON.encode(record.files)
                    },
                    callback: function(records, operation, success) {
                        if (!success) Ext.ux.ToastMessage('Cannot load Library files', 'error');
                    }
                });
            }

            // Set library protocol
            var libraryProtocolField = Ext.getCmp('libraryProtocolField');
            libraryProtocolField.select(record.libraryProtocolId);
            libraryProtocolField.fireEvent('select', libraryProtocolField, libraryProtocolField.findRecordByValue(record.libraryProtocolId), 'edit');

            // Set organism
            var organismField = Ext.getCmp('organismField');
            organismField.select(record.organismId);
            organismField.fireEvent('select', organismField, organismField.findRecordByValue(record.organismId));

            // Set index type
            var indexType = Ext.getCmp('indexType');
            indexType.select(record.indexTypeId);
            indexType.fireEvent('select', indexType, indexType.findRecordByValue(record.indexTypeId), 'edit');

            // Set concentration method
            var concentrationMethodField = Ext.getCmp('concentrationMethodField');
            concentrationMethodField.select(record.concentrationMethodId);
            concentrationMethodField.fireEvent('select', concentrationMethodField, concentrationMethodField.findRecordByValue(record.concentrationMethodId));

            // Set read length
            var readLengthField = Ext.getCmp('readLengthField');
            readLengthField.select(record.readLengthId);
            readLengthField.fireEvent('select', readLengthField, readLengthField.findRecordByValue(record.readLengthId));

            Ext.getCmp('addWndBtn').setConfig('text', 'Save');
        }

        this.initializeTooltips();
    },

    showSampleCard: function(card) {
        var wnd = card.up('window');

        Ext.getCmp('sampleProtocolInfo').hide();
        Ext.getCmp('addWndBtn').show();
        Ext.getStore('libraryProtocolsStore').removeAll();

        if (wnd.mode == 'add') {
            Ext.getStore('fileSampleStore').removeAll();
            Ext.getCmp('saveAndAddWndBtn').show();
        }

        else {
            var record = wnd.record.data,
                form = Ext.getCmp('sampleForm').getForm();

            // Show Sample barcode
            Ext.getCmp('sampleBarcodeField').show().setHtml(record.barcode);

            // Set field values
            form.setValues(record);

            if (record.equalRepresentation == 'False') Ext.getCmp('equalRepresentationRadio4').setValue(true);
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

            // Set nucleic acid type
            var nucleicAcidTypeField = Ext.getCmp('nucleicAcidTypeField');
            nucleicAcidTypeField.select(record.nucleicAcidTypeId);
            nucleicAcidTypeField.fireEvent('select', nucleicAcidTypeField, nucleicAcidTypeField.findRecordByValue(record.nucleicAcidTypeId), 'edit');

            // Set organism
            var organismSampleField = Ext.getCmp('organismSampleField');
            organismSampleField.select(record.organismId);
            organismSampleField.fireEvent('select', organismSampleField, organismSampleField.findRecordByValue(record.organismId));

            // Set concentration method
            var concentrationSampleMethodField = Ext.getCmp('concentrationSampleMethodField');
            concentrationSampleMethodField.select(record.concentrationMethodId);
            concentrationSampleMethodField.fireEvent('select', concentrationSampleMethodField, concentrationSampleMethodField.findRecordByValue(record.concentrationMethodId));

            // Set RNA Quality
            var rnaQualityField = Ext.getCmp('rnaQualityField');
            rnaQualityField.select(record.rnaQuality);
            rnaQualityField.fireEvent('select', rnaQualityField, rnaQualityField.findRecordByValue(record.rnaQuality));

            // Set read length
            var readLengthSampleField = Ext.getCmp('readLengthSampleField');
            readLengthSampleField.select(record.readLengthId);
            readLengthSampleField.fireEvent('select', readLengthSampleField, readLengthSampleField.findRecordByValue(record.readLengthId));

            Ext.getCmp('addWndBtn').setConfig('text', 'Save');
        }

        this.initializeTooltips();
    },

    setLibraryType: function(fld, record, eOpts) {
        var wnd = fld.up('window'),
            libraryProtocolInfo = Ext.getCmp('libraryProtocolInfo'),
            libraryTypesStore = Ext.getStore('libraryTypesStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField');

        if (record && record.get('name') != 'Other') {
            libraryProtocolInfo.show();
            libraryProtocolInfo.setHtml(
                '<strong>Provider, Catalog: </strong>' + record.get('provider') + ', ' + record.get('catalog') + '<br>' +
                '<strong>Explanation: </strong>' + record.get('explanation') + '<br>' +
                '<strong>Input Requirements: </strong>' + record.get('inputRequirements') + '<br>' +
                '<strong>Typical Application: </strong>' + record.get('typicalApplication') + '<br>' +
                '<strong>Comments: </strong>' + record.get('comments')
            );
        } else {
            libraryProtocolInfo.hide();
        }

        libraryTypeField.reset();

        // Load Library Type
        wnd.setLoading();
        libraryTypesStore.load({
            params: {
                'library_protocol_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Library Types', 'error');
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

    setNumberOfIndexReads: function(fld, record, eOpts) {
        var wnd = fld.up('window'),
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
            indexReadsField.getStore().setData([{id: 1, name: 0}, {id: 2, name: 1}]);
        } else {
            // Nextera (I7, N701-N712; I5 S501-S517): # of index reads: 0,1,2
            indexReadsField.getStore().setData([{id: 1, name: 0}, {id: 2, name: 1}, {id: 3, name: 2}]);
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

    enableIndicesFields: function(fld, record) {
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

    setSampleProtocol: function(fld, record) {
        var wnd = fld.up('window'),
            sampleProtocolField = Ext.getCmp('sampleProtocolField'),
            rnaQualityField = Ext.getCmp('rnaQualityField');

        if (record.data.type == 'RNA') {
            rnaQualityField.setDisabled(false);
        } else {
            rnaQualityField.setDisabled(true);
        }

        // Load Sample Protocols
        Ext.getStore('libraryProtocolsStore').load({
            params: {
                'type': record.data.type
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Library Protocols', 'error');
                } else {
                    sampleProtocolField.setDisabled(false);
                }

                if (wnd.mode == 'edit') {
                    var libraryProtocolId = wnd.record.data.libraryProtocolId;
                    sampleProtocolField.select(libraryProtocolId);
                    sampleProtocolField.fireEvent('select', sampleProtocolField, sampleProtocolField.findRecordByValue(libraryProtocolId), 'edit');
                }
            }
        });
    },

    setSampleType: function(fld, record) {
        var wnd = fld.up('window'),
            sampleProtocolInfo = Ext.getCmp('sampleProtocolInfo'),
            libraryTypesStore = Ext.getStore('libraryTypesStore'),
            sampleTypeField = Ext.getCmp('sampleTypeField');

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

        sampleTypeField.reset();

        // Load Library Type
        libraryTypesStore.load({
            params: {
                'library_protocol_id': record.data.id
            },
            callback: function(records, operation, success) {
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Library Types', 'error');
                } else {
                    sampleTypeField.setDisabled(false);
                    if (wnd.mode == 'edit' && eOpts == 'edit') {
                        var record = wnd.record.data;
                        sampleTypeField.select(record.libraryTypeId);
                        sampleTypeField.fireEvent('select', sampleTypeField, sampleTypeField.findRecordByValue(record.libraryTypeId));
                    }
                }
            }
        });
    },

    saveAndAdd: function(btn) {
        this.saveLibrary(btn, true);
    },

    saveAndClose: function(btn) {
        this.saveLibrary(btn);
    },

    initializeTooltips: function() {
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

    saveLibrary: function(btn, addAnother) {
        var form = null,
            url = '',
            data = {},
            params = {},
            nameFieldName = '',
            fileStoreName = '',
            wnd = btn.up('window'),
            card = Ext.getCmp('librarySamplePanel').getLayout().getActiveItem().id;
        addAnother = addAnother || false;

        if (card == 'libraryCard') {
            form = Ext.getCmp('libraryForm');
            data = form.getForm().getFieldValues();
            url = 'library/save/';
            nameFieldName = 'libraryName';
            fileStoreName = 'fileLibraryStore';
            params = {
                'mode': wnd.mode,
                'name': data.name,
                'library_id': (typeof wnd.record !== 'undefined') ? wnd.record.data.libraryId : '',
                'library_protocol': data.libraryProtocol,
                'library_type': data.libraryType,
                'amplification_cycles': data.amplificationCycles,
                'organism': data.organism,
                'index_type': data.indexType,
                'index_reads': data.indexReads,
                'index_i7': data.indexI7,
                'index_i5': data.indexI5,
                'equal_representation_nucleotides': data.equalRepresentationOfNucleotides,
                'concentration': data.concentration,
                'concentration_method': data.concentrationMethod,
                'mean_fragment_size': data.meanFragmentSize,
                'qpcr_result': data.qPCRResult,
                'read_length': data.readLength,
                'sequencing_depth': data.sequencingDepth,
                'comments': data.comments,
                'files': Ext.JSON.encode(form.down('filegridfield').getValue())
            };
        } else {
            form = Ext.getCmp('sampleForm');
            data = form.getForm().getFieldValues();
            url = 'sample/save/';
            nameFieldName = 'sampleName';
            fileStoreName = 'fileSampleStore';
            params = {
                'mode': wnd.mode,
                'name': data.name,
                'sample_id': (typeof wnd.record !== 'undefined') ? wnd.record.data.sampleId : '',
                'nucleic_acid_type': data.nucleicAcidType,
                'library_protocol': data.libraryProtocol,
                'library_type': data.libraryType,
                'organism': data.organism,
                'equal_representation_nucleotides': data.equalRepresentationOfNucleotides,
                'concentration': data.concentration,
                'concentration_method': data.concentrationMethod,
                'amplification_cycles': data.amplificationCycles,
                'rna_quality': data.rnaQuality,
                'read_length': data.readLength,
                'sequencing_depth': data.sequencingDepth,
                'comments': data.comments,
                'files': Ext.JSON.encode(form.down('filegridfield').getValue())
            };
        }
        data = form.getForm().getFieldValues();

        if (form.isValid()) {
            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: url,
                method: 'POST',
                timeout: 1000000,
                scope: this,
                params: params,

                success: function(response) {
                    var obj = Ext.JSON.decode(response.responseText),
                        grid = null;

                    if (obj.success) {
                        if (wnd.mode == 'add') {
                            grid = Ext.getCmp('librariesInRequestTable');
                            grid.getStore().add(obj.data);
                            Ext.ux.ToastMessage('Record has been added!');
                        } else {
                            Ext.getStore('librariesInRequestStore').reload({
                                params: {
                                    request_id: wnd.record.get('requestId')
                                }
                            });
                            // Ext.getStore('requestsStore').reload();
                            // Ext.getStore('librariesStore').reload();
                            MainHub.Utilities.reloadAllStores();
                            Ext.ux.ToastMessage('Record has been updated!');
                        }
                        Ext.getStore('PoolingTree').reload();

                        // Preserve all fields except for Name, if 'Save and Add another' button was pressed
                        if (addAnother) {
                            Ext.getCmp(nameFieldName).reset();
                            Ext.getStore(fileStoreName).removeAll();
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
                        console.error('[ERROR]: ' + url);
                        console.error(response);
                        wnd.setLoading(false);
                    }
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: ' + url);
                    console.error(response);
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    }
});
