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
            viewConfig: {
                stripeRows: false,
                getRowClass: function(record) {
                    return record.get('recordType') == 'L' ? 'library-row' : 'sample-row';
                }
            },

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
                    { text: 'Name', dataIndex: 'name', width: 150, locked: true, renderer: function(val, meta) {
                        meta.tdStyle = 'font-weight:bold';
                        return val;
                    } },
                    { text: '', dataIndex: 'recordType', width: 30, locked: true },
                    { text: 'Date', dataIndex: 'date' },
                    { text: 'Nucleic Acid Type', dataIndex: 'nucleicAcidType' },
                    { text: 'Protocol', dataIndex: 'libraryProtocol' },
                    { text: 'Type', dataIndex: 'libraryType' },
                    { text: 'Enrichment Cycles', dataIndex: 'enrichmentCycles' },
                    { text: 'Amplified Cycles', dataIndex: 'amplifiedCycles' },
                    { text: 'Organism', dataIndex: 'organism' },
                    { text: 'Index Type', dataIndex: 'indexType' },
                    { text: 'Index Reads', dataIndex: 'indexReads' },
                    { text: 'Index I7', dataIndex: 'indexI7' },
                    { text: 'Index I5', dataIndex: 'indexI5' },
                    { text: 'Equal Representation', dataIndex: 'equalRepresentation', renderer: function(val) {
                        return val == 'True' ? 'Yes' : 'No';
                    } },
                    { text: 'DNA Dissolved In', dataIndex: 'DNADissolvedIn' },
                    { text: 'Concentration', dataIndex: 'concentration' },
                    { text: 'Concentration Method', dataIndex: 'concentrationMethod' },
                    { text: 'Sample Volume', dataIndex: 'sampleVolume' },
                    { text: 'Mean Fragment Size', dataIndex: 'meanFragmentSize' },
                    { text: 'qPCR Result', dataIndex: 'qPCRResult' },
                    { text: 'Sequencing Run Condition', dataIndex: 'sequencingRunCondition' },
                    { text: 'Sequencing Depth', dataIndex: 'sequencingDepth' },
                    { text: 'DNase Treatment', dataIndex: 'DNaseTreatment', renderer: function(val) {
                        if (val == 'True') {
                            return 'Yes';
                        } else if (val == 'False') {
                            return 'No';
                        } else {
                            return '';
                        }
                    } },
                    { text: 'RNA Quality', dataIndex: 'rnaQuality' },
                    { text: 'RNA Spike In', dataIndex: 'rnaSpikeIn', renderer: function(val) {
                        if (val == 'True') {
                            return 'Yes';
                        } else if (val == 'False') {
                            return 'No';
                        } else {
                            return '';
                        }
                    } },
                    { text: 'Sample Preparation Protocol', dataIndex: 'samplePreparationProtocol' },
                    { text: 'Requested Sample Treatment', dataIndex: 'requestedSampletreatment' },
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
