Ext.define('LibraryField', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'name', type: 'string'},
        {name: 'id', type: 'int'}
    ]
});

Ext.define('MainHub.view.tables.libraries.LibraryWindow', {
    extend: 'Ext.window.Window',
    alias: 'library_wnd',
    xtype: 'library_wnd',

    requires: ['MainHub.view.tables.libraries.LibraryWindowController'],

    controller: 'tables-libraries-librarywindow',

    height: 700,
    width: 670,

    modal: true,
    resizable: false,
    layout: 'fit',  // to make the form fit into the tab

    items: [
        {
            xtype: 'tabpanel',
            border: 0,
            items: [
                {
                    title: 'Library',       // Tab 'Library'
                    border: 0,
                    scrollable: 'y',

                    items: [{
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
                            anchor: '100%'
                        },

                        items: [
                            {
                                name: 'libraryName',
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
                                minValue: 0,
                                maxValue: 99
                            },
                            {
                                xtype: 'combobox',
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
                                valueField: 'id',
                                name: 'indexReads',
                                fieldLabel: 'Number of Index Reads <sup><strong><span class="field-tooltip" tooltip-text="Number of Index Reads = 0: Libraries do not carry any barcode, no barcode will be read during sequencing.<br/><br/>Number of Index Reads = 1: Single-indexed libraries. Index on adapter P7 will be read during sequencing (true for most applications).<br/><br/>Number of Index Reads = 2: Dual-indexed libraries. Index on Adapter P7 and P5 will be read. (i.e Nextera libraries or if a high degree of multiplexing is needed)">[?]</span></strong></sup>',
                                emptyText: 'Number of Index Reads',
                                forceSelection: true,

                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: '0'},
                                        {id: 2, name: '1'},
                                        {id: 3, name: '2'}
                                    ]
                                })
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'index',
                                valueField: 'id',
                                name: 'indexI7',
                                id: 'indexI7Field',
                                itemId: 'indexI7Field',
                                fieldLabel: 'Index 1 (I7) <sup><strong><span class="field-tooltip" tooltip-text="Select from predefined list; make sure the displayed index is the sequence used for barcoding. Or enter sequence of index used for barcoding (typically 6 nucleotides)">[?]</span></strong></sup>',
                                emptyText: 'Index 1 (I7)',
                                store: 'indexI7Store',
                                disabled: true
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'index',
                                valueField: 'id',
                                name: 'indexI5',
                                id: 'indexI5Field',
                                itemId: 'indexI5Field',
                                fieldLabel: 'Index 2 (I5) <sup><strong><span class="field-tooltip" tooltip-text="Select from predefined list; make sure the displayed index is the sequence used for barcoding. Or enter sequence of index used for barcoding (typically 6 nucleotides)">[?]</span></strong></sup>',
                                emptyText: 'Index 2 (I5)',
                                store: 'indexI5Store',
                                disabled: true
                            },
                            {
                                xtype: 'fieldcontainer',
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
                                        id: 'radio1',
                                        checked: true,
                                        margin: '0 15px 0 0'
                                    },
                                    {
                                        boxLabel: 'No',
                                        name: 'equalRepresentationOfNucleotides',
                                        inputValue: false,
                                        id: 'radio2'
                                    }
                                ]
                            },
                            {
                                name: 'DNADissolvedIn',
                                fieldLabel: 'DNA Dissolved In',
                                emptyText: 'DNA Dissolved In',
                                labelAttrTpl: 'data-qtip=""'
                            },
                            {
                                xtype: 'numberfield',
                                name: 'concentration',
                                fieldLabel: 'Concentration (ng/µl)',
                                emptyText: 'Concentration (ng/µl)',
                                labelAttrTpl: 'data-qtip=""',
                                minValue: 0
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'concentrationDeterminedBy',
                                fieldLabel: 'Concentration Determined by',
                                emptyText: 'Concentration Determined by',
                                labelAttrTpl: 'data-qtip=""',
                                store: 'concentrationMethodsStore'
                                // forceSelection: true
                            },
                            {
                                xtype: 'numberfield',
                                name: 'sampleVolume',
                                fieldLabel: 'Sample Volume (µl)',
                                emptyText: 'Sample Volume (µl)',
                                minValue: 0,
                                allowDecimals: false
                            },
                            {
                                xtype: 'numberfield',
                                name: 'meanFragmentSize',
                                fieldLabel: 'Mean Fragment Size (bp) <sup><strong><span class="field-tooltip" tooltip-text="Specify mean fragments size of library, upload Bioanalyzer or Fragmentanalyzer files">[?]</span></strong></sup>',
                                emptyText: 'Mean Fragment Size (bp)',
                                minValue: 0,
                                allowDecimals: false
                            },
                            {
                                xtype: 'numberfield',
                                name: 'qPCRResult',
                                fieldLabel: 'qPCR Result (nM)',
                                emptyText: 'qPCR Result (nM)',
                                minValue: 0
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'sequencingRunCondition',
                                fieldLabel: 'Sequencing Run Condition',
                                emptyText: 'Sequencing Run Condition',
                                store: 'sequencingRunConditionsStore',
                                forceSelection: true
                            },
                            {
                                xtype: 'numberfield',
                                name: 'sequencingDepth',
                                fieldLabel: 'Sequencing Depth (M)',
                                emptyText: 'Sequencing Depth (M)',
                                minValue: 0,
                                allowDecimals: false
                            },
                            {
                                xtype: 'textarea',
                                name: 'comments',
                                fieldLabel: 'Comments',
                                emptyText: 'Comments',
                                allowBlank: true
                            }
                        ]
                    }]
                },
                {
                    title: 'Sample',       // Tab 'Sample'
                    border: 0,
                    padding: 15,

                    html: ':)'
                }
            ]
        }
    ],

    bbar: [
        '->',
        {
            xtype: 'button',
            itemId: 'cancelBtn',
            text: 'Cancel'
        },
        {
            xtype: 'button',
            itemId: 'saveAndAddLibraryWndBtn',
            id: 'saveAndAddLibraryWndBtn',
            text: 'Save and Add another',
            hidden: true,
            disabled: true
        },
        {
            xtype: 'button',
            itemId: 'addLibraryWndBtn',
            id: 'addLibraryWndBtn',
            text: 'Add',
            hidden: true
        },
        {
            xtype: 'button',
            itemId: 'editLibraryWndBtn',
            id: 'editLibraryWndBtn',
            text: 'Update',
            hidden: true
        }
    ]
});