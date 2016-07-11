Ext.define('MainHub.view.tables.libraries.LibraryWindow', {
    extend: 'Ext.window.Window',
    alias: 'library_wnd',
    xtype: 'library_wnd',

    requires: ['MainHub.view.tables.libraries.LibraryWindowController'],

    controller: 'tables-libraries-librarywindow',

    height: 700,
    width: 500,

    modal: true,
    // resizable: false,

    items: [
        {
            xtype: 'tabpanel',
            layout: 'anchor',
            border: 0,
            items: [
                {
                    title: 'Library',
                    border: 0,
                    items: [{
                        xtype: 'form',
                        id: 'libraryForm',
                        itemId: 'libraryForm',
                        layout: 'anchor',
                        border: 0,
                        padding: 15,

                        defaultType: 'textfield',
                        defaults: {
                            submitEmptyText: false,
                            allowBlank: false,
                            labelWidth: 150,
                            anchor: '100%'
                        },

                        items: [
                            {
                                name: 'libraryName',
                                fieldLabel: 'Name',
                                emptyText: 'Name'
                            },
                            {
                                name: 'libraryProtocol',
                                fieldLabel: 'Protocol for Library Preparation',
                                emptyText: 'Protocol for Library Preparation'
                            },
                            {
                                name: 'libraryType',
                                fieldLabel: 'Type',
                                emptyText: 'Type'
                            },
                            {
                                name: 'organism',
                                fieldLabel: 'Organism',
                                emptyText: 'Organism'
                            },
                            {
                                name: 'indexReads',
                                fieldLabel: 'Number of Index Reads',
                                emptyText: 'Number of Index Reads'
                            },
                            {
                                name: 'equalRepresentationOfNucleotides',
                                fieldLabel: 'Equal Representation of Nucleotides',
                                emptyText: 'Equal Representation of Nucleotides'
                            },
                            {
                                name: 'DANADissolvedIn',
                                fieldLabel: 'DNA Dissolved In',
                                emptyText: 'DNA Dissolved In'
                            },
                            {
                                name: 'concentration',
                                fieldLabel: 'Concentration (ng/µl)',
                                emptyText: 'Concentration (ng/µl)'
                            },
                            {
                                name: 'concentrationDeterminedBy',
                                fieldLabel: 'Concentration Determined by',
                                emptyText: 'Concentration Determined by'
                            },

                            {
                                name: 'sampleVolume',
                                fieldLabel: 'Sample Volume (µl)',
                                emptyText: 'Sample Volume (µl)'
                            },
                            {
                                name: 'qPCRResult',
                                fieldLabel: 'qPCR Result (nM)',
                                emptyText: 'qPCR Result (nM)'
                            },
                            {
                                name: 'sequencingRunCondition',
                                fieldLabel: 'Sequencing Run Condition',
                                emptyText: 'Sequencing Run Condition'
                            }
                        ]
                    }]
                },
                {
                    title: 'Sample',
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