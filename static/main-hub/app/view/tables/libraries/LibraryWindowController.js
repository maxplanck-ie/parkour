Ext.define('MainHub.view.tables.libraries.LibraryWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-librarywindow',

    config: {
        control: {
            '#': {
                boxready: 'onLibraryWindowBoxready'
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
            '#saveAndAddLibraryWndBtn': {
                click: 'onSaveAndAddLibraryWndBtnClick'
            },
            '#addLibraryWndBtn': {
                click: 'onAddLibraryWndBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onLibraryWindowBoxready: function(wnd) {
        if (wnd.mode == 'add') {
            Ext.getCmp('saveAndAddLibraryWndBtn').show();
            Ext.getCmp('addLibraryWndBtn').show();
        } else {

        }

        // Load Library Protocols
        wnd.setLoading();
        Ext.getStore('libraryProtocolsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Library Protocols', 'error');
            wnd.setLoading(false);
        });

        // Load Organisms
        wnd.setLoading();
        Ext.getStore('organismsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Organisms', 'error');
            wnd.setLoading(false);
        });

        // Load Index Types
        wnd.setLoading();
        Ext.getStore('indexTypesStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Index Types', 'error');
            wnd.setLoading(false);
        });

        // Load Concentration Methods
        wnd.setLoading();
        Ext.getStore('concentrationMethodsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Concentration Methods', 'error');
            wnd.setLoading(false);
        });

        // Load Sequencing Run Conditions
        wnd.setLoading();
        Ext.getStore('sequencingRunConditionsStore').load(function(records, operation, success) {
            if (!success) Ext.ux.ToastMessage('Cannot load Sequencing Run Conditions', 'error');
            wnd.setLoading(false);
        });
    },

    onLibraryProtocolFieldSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            libraryTypeStore = Ext.getStore('libraryTypeStore'),
            libraryTypeField = Ext.getCmp('libraryTypeField'),
            keepLibraryTypeField = Ext.getCmp('keepLibraryTypeField');

        // Load Library Type
        wnd.setLoading();
        libraryTypeStore.load({
            params: {
                'library_protocol_id': record.data.id
            },
            callback: function(records, operation, success) {
                libraryTypeField.setDisabled(false);
                keepLibraryTypeField.setDisabled(false);
                if (!success) Ext.ux.ToastMessage('Cannot load Principal Investigators', 'error');

                wnd.setLoading(false);
            }
        });
    },

    onIndexTypeSelect: function(fld, record) {
        var wnd = fld.up('library_wnd'),
            indexI7Store = Ext.getStore('indexI7Store'),
            indexI5Store = Ext.getStore('indexI5Store'),
            indexI7Field = Ext.getCmp('indexI7Field'),
            indexI5Field = Ext.getCmp('indexI5Field');

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

    onSaveAndAddLibraryWndBtnClick: function() {
        this.saveLibrary();
    },

    onAddLibraryWndBtnClick: function(btn) {
        this.saveLibrary();
    },

    saveLibrary: function() {
        var form = Ext.getCmp('libraryForm'),
            wnd = form.up('library_wnd');

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            // wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: 'save_library/',
                method: 'GET',
                timeout: 1000000,
                scope: this,

                params: {
                    'library_name': data.libraryName,
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
                    'qpcr_result': data.qPCRResult,
                    'sequencing_run_condition': data.sequencingRunCondition,
                    'sequencing_depth': data.sequencingDepth,
                    'comments': data.comments
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        // var grid = Ext.getCmp('researchersTable');
                        // grid.fireEvent('refresh', grid);
                        Ext.ux.ToastMessage('Library has been added!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.log('[ERROR]: save_library(): ' + obj.error);
                        console.log(response);
                    }
                    // wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.log('[ERROR]: save_library()');
                    console.log(response);
                    // wnd.close();
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
