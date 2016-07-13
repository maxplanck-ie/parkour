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
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'libraryProtocol',
                                fieldLabel: 'Protocol for Library Preparation',
                                emptyText: 'Protocol for Library Preparation',
                                forceSelection: true,
                                
                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: 'Protocol 1'},
                                        {id: 2, name: 'Protocol 2'},
                                        {id: 3, name: 'Protocol 3'},
                                        {id: 4, name: 'Other (specify in comments)'}
                                    ]
                                })
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepLibraryProtocol',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'libraryType',
                                fieldLabel: 'Library Type',
                                emptyText: 'Library Type',
                                forceSelection: true,

                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: 'Type 1'},
                                        {id: 2, name: 'Type 2'},
                                        {id: 3, name: 'Type 3'},
                                        {id: 4, name: 'Other (specify in comments)'}
                                    ]
                                })
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepLibraryType',
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
                                forceSelection: true,

                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: 'Organism 1'},
                                        {id: 2, name: 'Organism 2'},
                                        {id: 3, name: 'Organism 3'},
                                        {id: 4, name: 'Other (specify in comments)'}
                                    ]
                                })
                            },
                            {
                                xtype: 'checkboxfield',
                                name: 'keepOrganism',
                                boxLabel: 'Keep',
                                margin: '-10px 0 0 15px'
                            },
                            {
                                xtype: 'combobox',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                name: 'indexReads',
                                fieldLabel: 'Number of Index Reads',
                                emptyText: 'Number of Index Reads',
                                forceSelection: true,

                                store: Ext.create('Ext.data.Store', {
                                    model: 'LibraryField',
                                    data: [
                                        {id: 1, name: '1'},
                                        {id: 2, name: '2'},
                                        {id: 3, name: '3'}
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
                                fieldLabel: 'Index 1',
                                emptyText: 'Index 1',
                                colspan: 2
                            },
                            {
                                name: 'index2',
                                fieldLabel: 'Index 2',
                                emptyText: 'Index 2',
                                colspan: 2
                            },
                            {
                                xtype: 'fieldcontainer',
                                fieldLabel: 'Equal Representation of Nucleotides',
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
                                emptyText: 'DNA Dissolved In'
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