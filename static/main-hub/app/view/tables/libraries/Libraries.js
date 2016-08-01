Ext.define('MainHub.view.tables.libraries.Libraries', {
    extend: 'Ext.container.Container',
    xtype: 'libraries',

    requires: [
        'MainHub.view.tables.libraries.LibrariesController',
        'MainHub.view.tables.libraries.LibraryWindow'
    ],

    controller: 'tables-libraries-libraries',

    anchor : '100% -1',
    layout: 'fit',

    items: [
        {
            xtype: 'grid',
            id: 'librariesTable',
            itemId: 'librariesTable',
            height: Ext.Element.getViewportHeight() - 64,
            region: 'center',
            padding: 15,

            header: {
                title: 'Libraries',
                items: [
                    {
                        xtype: 'textfield',
                        itemId: 'searchField',
                        emptyText: 'Search',
                        width: 200,
                        margin: '0 15px 0 0'
                    },
                    {
                        xtype: 'button',
                        itemId: 'addLibraryBtn',
                        text: 'Add'
                    }
                ]
            },

            store: 'librariesStore',

            columns: {
                items: [
                    { text: 'Name', dataIndex: 'name', width: 150, locked: true },
                    { text: '', dataIndex: 'recordType', width: 30, locked: true },
                    { text: 'Date', dataIndex: 'date' },
                    { text: 'Protocol', dataIndex: 'libraryProtocol' },
                    { text: 'Type', dataIndex: 'libraryType' },
                    { text: 'Enrichment Cycles', dataIndex: 'enrichmentCycles' },
                    { text: 'Organism', dataIndex: 'organism' },
                    { text: 'Index Type', dataIndex: 'indexType' },
                    { text: 'Index Reads', dataIndex: 'indexReads' },
                    { text: 'Index I7', dataIndex: 'indexI7' },
                    { text: 'Index I5', dataIndex: 'indexI5' },
                    { text: 'Equal Representation', dataIndex: 'equalRepresentation' },
                    { text: 'DNA Dissolved In', dataIndex: 'DNADissolvedIn' },
                    { text: 'Concentration', dataIndex: 'concentration' },
                    { text: 'Concentration Method', dataIndex: 'concentrationMethod' },
                    { text: 'Sample Volume', dataIndex: 'sampleVolume' },
                    { text: 'Mean Fragment Size', dataIndex: 'meanFragmentSize' },
                    { text: 'qPCR Result', dataIndex: 'qPCRResult' },
                    { text: 'Sequencing Run Condition', dataIndex: 'sequencingRunCondition' },
                    { text: 'Sequencing Depth', dataIndex: 'sequencingDepth' },
                    { text: 'Comments', dataIndex: 'comments' }
                ]
            },

            plugins: [
                {
                    ptype: 'bufferedrenderer',
                    trailingBufferZone: 100,
                    leadingBufferZone: 100
                }
            ]
        }
    ]
});
