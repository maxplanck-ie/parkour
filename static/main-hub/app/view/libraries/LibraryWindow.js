Ext.define('MainHub.view.libraries.LibraryWindow', {
    extend: 'Ext.window.Window',
    alias: 'library_wnd',
    xtype: 'library_wnd',
    id: 'library_wnd',

    requires: [
        'MainHub.view.libraries.LibraryWindowController',
        'Ext.ux.FileGridField'
    ],

    controller: 'libraries-librarywindow',

    height: 225,
    width: 400,

    modal: true,
    resizable: false,
    layout: 'fit',

    items: [
        {
            xtype: 'panel',
            id: 'librarySamplePanel',
            border: 0,
            layout: 'card',
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'center',
                        pack: 'center'
                    },
                    defaults: {
                        border: 0
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            defaultType: 'button',
                            defaults: {
                                margin: 10,
                                width: 100,
                                height: 40
                            },
                            items: [
                                {
                                    id: 'libraryCardBtn',
                                    itemId: 'libraryCardBtn',
                                    text: 'Library'
                                },
                                {
                                    id: 'sampleCardBtn',
                                    itemId: 'sampleCardBtn',
                                    text: 'Sample'
                                }
                            ]
                        },
                        {
                            id: 'cardHelpText',
                            width: 350,
                            html: '<p style="text-align:center">Choose <strong>Library</strong> if samples for sequencing are completely prepared by user.<br><br>Choose <strong>Sample</strong> if libraries are prepared by facility.</p>'
                        }
                    ]
                },
                {
                    xtype: 'container',
                    id: 'libraryCard',
                    scrollable: 'y',

                    items: [
                        {
                            xtype: 'container',
                            id: 'libraryBarcodeField',
                            margin: '15px 15px 0 15px',
                            style: {
                                padding: '25px 10px 10px 10px',
                                border: '1px solid #d0d0d0',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '50px',
                                color: '#757575'
                            },
                            height: 70,
                            hidden: true
                        },
                            {
                            xtype: 'form',
                            id: 'libraryForm',
                            itemId: 'libraryForm',
                            border: 0,
                            padding: 15,
                            defaultType: 'textfield',
                            defaults: {
                                submitEmptyText: false,
                                allowBlank: false,
                                labelWidth: 220,
                                labelStyle: 'padding: 5px 0 0 0',
                                anchor: '100%'
                            },

                            items: [
                                {
                                    name: 'name',
                                    id: 'libraryName',
                                    fieldLabel: 'Library Name <sup><strong><span class="field-tooltip" tooltip-text="Name must be unique for assigned project. Field must contain only A-Za-z0-9 as well as - and _">[?]</span></strong></sup>',
                                    emptyText: 'Library Name',
                                    regex: new RegExp("^[A-Za-z0-9_\-]+$"),
                                    regexText: 'Only A-Za-z0-9 as well as _ and - are allowed'
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'libraryProtocolField',
                                    itemId: 'libraryProtocolField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'libraryProtocol',
                                    fieldLabel: 'Protocol for Library Preparation <sup><strong><span class="field-tooltip" tooltip-text="Select library construction protocol from predefined list or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Protocol for Library Preparation',
                                    store: 'libraryProtocolsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'libraryTypeField',
                                    itemId: 'libraryTypeField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'libraryType',
                                    fieldLabel: 'Library Type <sup><strong><span class="field-tooltip" tooltip-text="Library Type is automatically filled based on library construction protocol, if needed select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Library Type',
                                    store: 'libraryTypeStore',
                                    forceSelection: true,
                                    disabled: true
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'enrichmentCycles',
                                    fieldLabel: 'Number of enrichment cycles <sup><strong><span class="field-tooltip" tooltip-text="Number of PCR cycles done for library enrichment">[?]</span></strong></sup>',
                                    emptyText: 'Number of enrichment cycles',
                                    allowDecimals: false,
                                    minValue: 1
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'organismField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'organism',
                                    fieldLabel: 'Organism <sup><strong><span class="field-tooltip" tooltip-text="Select from list with predefined options or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Organism',
                                    store: 'organismsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'indexType',
                                    itemId: 'indexType',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'indexType',
                                    fieldLabel: 'Index Type <sup><strong><span class="field-tooltip" tooltip-text="Select from list with predefined options or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Index Type',
                                    store: 'indexTypesStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'indexReadsField',
                                    itemId: 'indexReadsField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'name',
                                    name: 'indexReads',
                                    fieldLabel: 'Number of Index Reads <sup><strong><span class="field-tooltip" tooltip-text="Number of Index Reads = 0: Libraries do not carry any barcode, no barcode will be read during sequencing.<br/><br/>Number of Index Reads = 1: Single-indexed libraries. Index on adapter P7 will be read during sequencing (true for most applications).<br/><br/>Number of Index Reads = 2: Dual-indexed libraries. Index on Adapter P7 and P5 will be read. (i.e Nextera libraries or if a high degree of multiplexing is needed)">[?]</span></strong></sup>',
                                    emptyText: 'Number of Index Reads',
                                    forceSelection: true,
                                    disabled: true,

                                    store: Ext.create('Ext.data.Store', {
                                        fields: [
                                            { name: 'name', type: 'int' },
                                            { name: 'id', type: 'int' }
                                        ],
                                        data: []
                                    })
                                },
                                {
                                    xtype: 'combobox',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{index}',
                                        '</tpl>'
                                    ),
                                    valueField: 'index',
                                    name: 'indexI7',
                                    id: 'indexI7Field',
                                    itemId: 'indexI7Field',
                                    fieldLabel: 'Index 1 (I7) <sup><strong><span class="field-tooltip" tooltip-text="Select from predefined list; make sure the displayed index is the sequence used for barcoding. Or enter sequence of index used for barcoding (typically 6 nucleotides)">[?]</span></strong></sup>',
                                    emptyText: 'Index 1 (I7)',
                                    regex: new RegExp("^(?=(?:.{6}|.{8})$)[ATCG]+$"),
                                    regexText: 'Only A, T, C and G (uppercase) are allowed. Index length must be 6 or 8.',
                                    store: 'indexI7Store',
                                    disabled: true
                                },
                                {
                                    xtype: 'combobox',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{index}',
                                        '</tpl>'
                                    ),
                                    valueField: 'index',
                                    name: 'indexI5',
                                    id: 'indexI5Field',
                                    itemId: 'indexI5Field',
                                    fieldLabel: 'Index 2 (I5) <sup><strong><span class="field-tooltip" tooltip-text="Select from predefined list; make sure the displayed index is the sequence used for barcoding. Or enter sequence of index used for barcoding (typically 6 nucleotides)">[?]</span></strong></sup>',
                                    emptyText: 'Index 2 (I5)',
                                    regex: new RegExp("^(?=(?:.{6}|.{8})$)[ATCG]+$"),
                                    regexText: 'Only A, T, C and G (uppercase) are allowed. Index length must be 6 or 8.',
                                    store: 'indexI5Store',
                                    disabled: true
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    id: 'equalRepresentation',
                                    fieldLabel: 'Equal Representation of Nucleotides <sup><strong><span class="field-tooltip" tooltip-text="For best sequencing quality all 4 nucleotides should be at each position of the insert (up- and downstream of sequencing adaptors) represented at an equal frequency.<br><br>This is true i.e. for applications like ChIP-Seq, RNA-Seq and WGS (<strong>select Yes</strong>).<br><br>In case your insert has an uneven representation of nucleotides (Amplicon-Seq, internal usage of barcodes) <strong>select No</strong> and specify in the comments field (below).">[?]</span></strong></sup>',
                                    defaultType: 'radiofield',
                                    defaults: {
                                        // flex: 1
                                    },
                                    layout: 'hbox',
                                    items: [
                                        {
                                            boxLabel: 'Yes',
                                            name: 'equalRepresentationOfNucleotides',
                                            inputValue: true,
                                            id: 'equalRepresentationRadio1',
                                            checked: true,
                                            margin: '0 15px 0 0'
                                        },
                                        {
                                            boxLabel: 'No',
                                            name: 'equalRepresentationOfNucleotides',
                                            inputValue: false,
                                            id: 'equalRepresentationRadio2'
                                        }
                                    ]
                                },
                                {
                                    name: 'DNADissolvedIn',
                                    fieldLabel: 'DNA Dissolved In',
                                    emptyText: 'DNA Dissolved In'
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'concentration',
                                    fieldLabel: 'Concentration (ng/µl)',
                                    emptyText: 'Concentration (ng/µl)',
                                    minValue: 1
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'concentrationMethodField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'concentrationDeterminedBy',
                                    fieldLabel: 'Concentration Determined by',
                                    emptyText: 'Concentration Determined by',
                                    store: 'concentrationMethodsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'sampleVolume',
                                    fieldLabel: 'Sample Volume (µl)',
                                    emptyText: 'Sample Volume (µl)',
                                    minValue: 1,
                                    allowDecimals: false
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'meanFragmentSize',
                                    fieldLabel: 'Mean Fragment Size (bp) <sup><strong><span class="field-tooltip" tooltip-text="Specify mean fragments size of library, upload Bioanalyzer or Fragmentanalyzer files">[?]</span></strong></sup>',
                                    emptyText: 'Mean Fragment Size (bp)',
                                    minValue: 1,
                                    allowDecimals: false
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'qPCRResult',
                                    fieldLabel: 'qPCR Result (nM) <sup><strong><span class="field-tooltip" tooltip-text="Use this field if qPCR was done for library quantification">[?]</span></strong></sup>',
                                    emptyText: 'qPCR Result (nM)',
                                    allowBlank: true,
                                    minValue: 1
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'readLengthField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'readLength',
                                    fieldLabel: 'Read Length <sup><strong><span class="field-tooltip" tooltip-text="Select from list with predefined options or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Read Length',
                                    store: 'readLengthsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'sequencingDepth',
                                    fieldLabel: 'Sequencing Depth (M)',
                                    emptyText: 'Sequencing Depth (M)',
                                    minValue: 1,
                                    allowDecimals: false
                                },
                                {
                                    xtype: 'filegridfield',
                                    fieldLabel: 'Files',
                                    store: 'fileLibraryStore',
                                    uploadFileUrl: 'library/upload_files/',
                                    getFileUrl: 'library/get_files/'
                                },
                                {
                                    xtype: 'textarea',
                                    name: 'comments',
                                    fieldLabel: 'Comments',
                                    emptyText: 'Comments',
                                    allowBlank: true,
                                    height: 150
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'container',         // Sample card
                    id: 'sampleCard',
                    scrollable: 'y',

                    items: [
                        {
                            xtype: 'container',
                            id: 'sampleBarcodeField',
                            margin: '15px 15px 0 15px',
                            style: {
                                padding: '25px 10px 10px 10px',
                                border: '1px solid #d0d0d0',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '50px',
                                color: '#757575'
                            },
                            height: 70,
                            hidden: true
                        },
                        {
                            xtype: 'form',
                            id: 'sampleForm',
                            itemId: 'sampleForm',
                            border: 0,
                            padding: 15,
                            defaultType: 'textfield',
                            defaults: {
                                submitEmptyText: false,
                                allowBlank: false,
                                labelWidth: 220,
                                labelStyle: 'padding: 5px 0 0 0',
                                anchor: '100%'
                            },

                            items: [
                                {
                                    name: 'name',
                                    id: 'sampleName',
                                    fieldLabel: 'Sample Name <sup><strong><span class="field-tooltip" tooltip-text="Name must be unique for assigned project. Field must contain only A-Za-z0-9 as well as - and _">[?]</span></strong></sup>',
                                    emptyText: 'Sample Name',
                                    regex: new RegExp("^[A-Za-z0-9_\-]+$"),
                                    regexText: 'Only A-Za-z0-9 as well as _ and - are allowed'
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'nucleicAcidTypeField',
                                    itemId: 'nucleicAcidTypeField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'nucleicAcidType',
                                    fieldLabel: 'Nucleic Acid Type <sup><strong><span class="field-tooltip" tooltip-text="Select nucleic acid type of your sample or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Nucleic Acid Type',
                                    store: 'nucleicAcidTypesStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'sampleProtocolField',
                                    itemId: 'sampleProtocolField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'sampleProtocol',
                                    fieldLabel: 'Protocol for Library Preparation <sup><strong><span class="field-tooltip" tooltip-text="Select library construction protocol from predefined list or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Protocol for Library Preparation',
                                    store: 'sampleProtocolsStore',
                                    forceSelection: true,
                                    disabled: true
                                },
                                {
                                    xtype: 'container',
                                    id: 'sampleProtocolInfo',
                                    margin: '0 0 15px 15px'
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'sampleTypeField',
                                    itemId: 'sampleTypeField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'libraryType',
                                    fieldLabel: 'Library Type <sup><strong><span class="field-tooltip" tooltip-text="Library Type is automatically filled based on library construction protocol, if needed select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Library Type',
                                    store: 'libraryTypeStore',
                                    forceSelection: true,
                                    disabled: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'organismSampleField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'organism',
                                    fieldLabel: 'Organism <sup><strong><span class="field-tooltip" tooltip-text="Select from list with predefined options or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Organism',
                                    store: 'organismsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    id: 'equalRepresentationSample',
                                    fieldLabel: 'Equal Representation of Nucleotides <sup><strong><span class="field-tooltip" tooltip-text="For best sequencing quality all 4 nucleotides should be at each position of the insert (up- and downstream of sequencing adaptors) represented at an equal frequency.<br><br>This is true i.e. for applications like ChIP-Seq, RNA-Seq and WGS (<strong>select Yes</strong>).<br><br>In case your insert has an uneven representation of nucleotides (Amplicon-Seq, internal usage of barcodes) <strong>select No</strong> and specify in the comments field (below).">[?]</span></strong></sup>',
                                    defaultType: 'radiofield',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            boxLabel: 'Yes',
                                            name: 'equalRepresentationOfNucleotides',
                                            inputValue: true,
                                            id: 'equalRepresentationRadio3',
                                            checked: true,
                                            margin: '0 15px 0 0'
                                        },
                                        {
                                            boxLabel: 'No',
                                            name: 'equalRepresentationOfNucleotides',
                                            inputValue: false,
                                            id: 'equalRepresentationRadio4'
                                        }
                                    ]
                                },
                                {
                                    name: 'DNADissolvedIn',
                                    fieldLabel: 'DNA/RNA Dissolved In',
                                    emptyText: 'DNA/RNA Dissolved In'
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'concentration',
                                    fieldLabel: 'Concentration (ng/µl)',
                                    emptyText: 'Concentration (ng/µl)',
                                    minValue: 1
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'concentrationSampleMethodField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'concentrationDeterminedBy',
                                    fieldLabel: 'Concentration Determined by',
                                    emptyText: 'Concentration Determined by',
                                    store: 'concentrationMethodsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'sampleVolume',
                                    fieldLabel: 'Sample Volume (µl)',
                                    emptyText: 'Sample Volume (µl)',
                                    minValue: 1,
                                    allowDecimals: false
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'sampleAmplifiedCycles',
                                    fieldLabel: 'Sample amplified (cycles) <sup><strong><span class="field-tooltip" tooltip-text="If sample has been already amplified, indicate the number of cycles">[?]</span></strong></sup>',
                                    emptyText: 'Sample amplified (cycles)',
                                    allowDecimals: false,
                                    minValue: 1,
                                    allowBlank: true
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    id: 'DNaseTreatmentField',
                                    fieldLabel: 'DNase Treatment (RNA only)',
                                    defaultType: 'radiofield',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            boxLabel: 'Yes',
                                            name: 'DNaseTreatment',
                                            inputValue: true,
                                            id: 'DNaseTreatmentRadio1',
                                            checked: true,
                                            margin: '0 15px 0 0'
                                        },
                                        {
                                            boxLabel: 'No',
                                            name: 'DNaseTreatment',
                                            inputValue: false,
                                            id: 'DNaseTreatmentRadio2'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'rnaQualityField',
                                    itemId: 'rnaQualityField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'rnaQuality',
                                    fieldLabel: 'RNA Quality (RIN, RQN) <sup><strong><span class="field-tooltip" tooltip-text="Select a number from 1 to 10 or select determined by facility">[?]</span></strong></sup>',
                                    emptyText: 'RNA Quality (RIN, RQN)',
                                    store: 'rnaQualityStore',
                                    forceSelection: true,
                                    disabled: true
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    id: 'rnaSpikeInField',
                                    fieldLabel: 'RNA Spike in',
                                    defaultType: 'radiofield',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            boxLabel: 'Yes',
                                            name: 'rnaSpikeIn',
                                            inputValue: true,
                                            id: 'rnaSpikeInRadio1',
                                            checked: true,
                                            margin: '0 15px 0 0'
                                        },
                                        {
                                            boxLabel: 'No',
                                            name: 'rnaSpikeIn',
                                            inputValue: false,
                                            id: 'rnaSpikeInRadio2'
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    name: 'samplePreparationProtocol',
                                    fieldLabel: 'Sample Preparation Protocol <sup><strong><span class="field-tooltip" tooltip-text="Which kit was used for RNA/DNA extraction? Did you perform mRNA enrichment, rRNA depletion, sample normalization, size selection or any other treatment?">[?]</span></strong></sup>',
                                    emptyText: 'Sample Preparation Protocol',
                                    allowBlank: true
                                },
                                {
                                    name: 'requestedSampleTreatment',
                                    fieldLabel: 'Requested Sample Treatment <sup><strong><span class="field-tooltip" tooltip-text="Please indicate, if we have to perform any any special treatment prior library preparation">[?]</span></strong></sup>',
                                    emptyText: 'Requested Sample Treatment',
                                    allowBlank: true
                                },
                                {
                                    xtype: 'combobox',
                                    id: 'readLengthSampleField',
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'id',
                                    name: 'readLength',
                                    fieldLabel: 'Read Length <sup><strong><span class="field-tooltip" tooltip-text="Select from list with predefined options or select other and specify in the comments field (below)">[?]</span></strong></sup>',
                                    emptyText: 'Read Length',
                                    store: 'readLengthsStore',
                                    forceSelection: true
                                },
                                {
                                    xtype: 'numberfield',
                                    name: 'sequencingDepth',
                                    fieldLabel: 'Sequencing Depth (M)',
                                    emptyText: 'Sequencing Depth (M)',
                                    minValue: 1,
                                    allowDecimals: false
                                },
                                {
                                    xtype: 'filegridfield',
                                    fieldLabel: 'Files',
                                    store: 'fileSampleStore',
                                    uploadFileUrl: 'sample/upload_files/',
                                    getFileUrl: 'sample/get_files/'
                                },
                                {
                                    xtype: 'textarea',
                                    name: 'comments',
                                    fieldLabel: 'Comments',
                                    emptyText: 'Comments',
                                    allowBlank: true,
                                    height: 150
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->',
            {
                xtype: 'button',
                itemId: 'cancelBtn',
                text: 'Cancel'
            },
            {
                xtype: 'button',
                itemId: 'saveAndAddWndBtn',
                id: 'saveAndAddWndBtn',
                text: 'Save and Add another',
                hidden: true
            },
            {
                xtype: 'button',
                itemId: 'addWndBtn',
                id: 'addWndBtn',
                text: 'Save and Close',
                hidden: true
            }
        ],
        hidden: true
    }]
});
