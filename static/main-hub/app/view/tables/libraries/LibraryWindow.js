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
    width: 500,

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
                        layout: {
                            type: 'table',
                            columns: 2
                        },
                        border: 0,
                        padding: 15,

                        defaultType: 'textfield',
                        defaults: {
                            submitEmptyText: false,
                            allowBlank: false,
                            labelWidth: 150,
                            anchor: '100%',
                            width: 375
                        },

                        items: [
                            {
                                name: 'libraryName',
                                fieldLabel: 'Library Name',
                                emptyText: 'Library Name',
                                labelAttrTpl: 'data-qtip="Name must be unique for assigned project. Field must contain only A-Za-z0-9 as well as - and _."',
                                regex: new RegExp("^[A-Za-z0-9_\-]+$"),
                                regexText: 'Only A-Za-z0-9 as well as _ and - are allowed'
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepLibraryName',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                id: 'libraryProtocolField',
                                itemId: 'libraryProtocolField',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'libraryProtocol',
                                fieldLabel: 'Protocol for Library Preparation',
                                emptyText: 'Protocol for Library Preparation',
                                labelAttrTpl: 'data-qtip="Select library construction protocol from predefined list or select other and specify in the comment field (below)."',
                                store: 'libraryProtocolsStore',
                                forceSelection: true
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepLibraryProtocol',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                id: 'libraryTypeField',
                                itemId: 'libraryTypeField',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'libraryType',
                                fieldLabel: 'Library Type',
                                emptyText: 'Library Type',
                                labelAttrTpl: 'data-qtip="Library Type is automatically filled based on library construction protocol, if needed select other and specify in the comment field (below)."',
                                store: 'libraryTypeStore',
                                forceSelection: true,
                                disabled: true
                            },
                            {
                                xtype: 'checkboxfield',
                                id: 'keepLibraryTypeField',
                                itemId: 'keepLibraryTypeField',
                                name: 'keepLibraryType',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px',
                                disabled: true
                            },
                            {
                                xtype: 'numberfield',
                                name: 'enrichmentCycles',
                                fieldLabel: 'Number of enrichment cycles',
                                emptyText: 'Number of enrichment cycles',
                                labelAttrTpl: 'data-qtip=""',
                                allowDecimals: false,
                                minValue: 0,
                                maxValue: 99
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepEnrichmentCycles',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'organism',
                                fieldLabel: 'Organism',
                                emptyText: 'Organism',
                                labelAttrTpl: 'data-qtip="Select from list with predefined options or select other and specify in the comment field (below)."',
                                store: 'organismsStore',
                                forceSelection: true
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepOrganism',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                id: 'indexReadsField',
                                itemId: 'indexReadsField',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'indexReads',
                                fieldLabel: 'Number of Index Reads',
                                emptyText: 'Number of Index Reads',
                                labelAttrTpl: 'data-qtip="Number of Index Reads = 0: Libraries do not carry any barcode, no barcode will be read during sequencing.<br/><br/>Number of Index Reads = 1: Single-indexed libraries. Index on adapter P7 will be read during sequencing (true for most applications).<br/><br/>Number of Index Reads = 2: Dual-indexed libraries. Index on Adapter P7 and P5 will be read. (i.e Nextera libraries or if a high degree of multiplexing is needed)."',
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
                                xtype: 'checkboxfield',
                                name: 'keepIndexReads',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                name: 'index1',
                                id: 'index1Field',
                                itemId: 'index1Field',
                                fieldLabel: 'Index 1 (I7)',
                                emptyText: 'Index 1 (I7)',
                                labelAttrTpl: 'data-qtip="Select from predefined list; make sure the displayed index is the sequence used for barcoding. Or enter sequence of index used for barcoding (typically 6 nucleotides)."',
                                colspan: 2,
                                disabled: true
                            },
                            {
                                name: 'index2',
                                id: 'index2Field',
                                itemId: 'index2Field',
                                fieldLabel: 'Index 2 (I5)',
                                emptyText: 'Index 2 (I5)',
                                colspan: 2,
                                disabled: true
                            },
                            {
                                xtype: 'fieldcontainer',
                                fieldLabel: 'Equal Representation of Nucleotides',
                                labelAttrTpl: 'data-qtip="In case your insert (up- and downstream of sequencing adaptors) has an uneven representation of nucleotides. For best sequencing quality all 4 nucleotides should be at each position represented at an equal frequency. This is true for applications like ChIP-Seq, RNA-Seq and WGS but can get problematic if amplicons are sequenced or samples that contain internal barcodes."',
                                defaultType: 'radiofield',
                                defaults: {
                                    // flex: 1
                                },
                                layout: 'hbox',
                                items: [
                                    {
                                        boxLabel: 'Yes',
                                        name: 'equalRepresentationOfNucleotides',
                                        inputValue: 1,
                                        id: 'radio1',
                                        margin: '0 15px 0 0'
                                    },
                                    {
                                        boxLabel: 'No',
                                        name: 'equalRepresentationOfNucleotides',
                                        inputValue: 0,
                                        id: 'radio2'
                                    }
                                ]
                            },

                            {
                                xtype: 'checkboxfield',
                                name: 'keepEqualRepresentationOfNucleotides',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                name: 'DANADissolvedIn',
                                fieldLabel: 'DNA Dissolved In',
                                emptyText: 'DNA Dissolved In',
                                labelAttrTpl: 'data-qtip=""'
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepDANADissolvedIn',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
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
                                xtype: 'checkboxfield',
                                name: 'keepConcentration',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
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
                                // forceSelection: true,

                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: 'Fluorometry'},
                                        {id: 2, name: 'Spectrophotometry'},
                                        {id: 3, name: 'Not in the list'}
                                    ]
                                })
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepConcentrationDeterminedBy',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'numberfield',
                                name: 'sampleVolume',
                                fieldLabel: 'Sample Volume (µl)',
                                emptyText: 'Sample Volume (µl)',
                                labelAttrTpl: 'data-qtip=""',
                                minValue: 0,
                                allowDecimals: false
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepSampleVolume',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'numberfield',
                                name: 'qPCRResult',
                                fieldLabel: 'qPCR Result (nM)',
                                emptyText: 'qPCR Result (nM)',
                                labelAttrTpl: 'data-qtip=""',
                                minValue: 0
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepQPCRResult',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'sequencingRunCondition',
                                fieldLabel: 'Sequencing Run Condition',
                                emptyText: 'Sequencing Run Condition',
                                labelAttrTpl: 'data-qtip=""',
                                forceSelection: true,

                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: 'Condition 1'},
                                        {id: 2, name: 'Condition 2'},
                                        {id: 3, name: 'Condition 3'}
                                    ]
                                })
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepSequencingRunCondition',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'numberfield',
                                name: 'sequencingDepth',
                                fieldLabel: 'Sequencing Depth (M)',
                                emptyText: 'Sequencing Depth (M)',
                                labelAttrTpl: 'data-qtip=""',
                                minValue: 0,
                                allowDecimals: false
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepSequencingDepth',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'textarea',
                                name: 'comments',
                                fieldLabel: 'Comments',
                                emptyText: 'Comments',
                                labelAttrTpl: 'data-qtip=""',
                                // width: 435,
                                colspan: 2
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
            hidden: true
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