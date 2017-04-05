Ext.define('MainHub.view.libraries.Libraries', {
    extend: 'Ext.container.Container',
    xtype: 'libraries',
    controller: 'libraries-libraries',

    requires: [
        'MainHub.view.libraries.LibrariesController',
        'MainHub.view.libraries.LibraryWindow'
    ],

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'librariesTable',
        itemId: 'librariesTable',
        height: Ext.Element.getViewportHeight() - 64,
        region: 'center',
        padding: 15,
        viewConfig: {
            stripeRows: false,
            getRowClass: function(record) {
                return record.get('recordType') === 'L' ? 'library-row' : 'sample-row';
            }
        },
        header: {
            title: 'Libraries and Samples',
            items: [{
                xtype: 'fieldcontainer',
                defaultType: 'checkboxfield',
                layout: 'hbox',
                margin: '0 20 0 0',
                items: [{
                    boxLabel: 'Show Libraries',
                    itemId: 'showLibrariesCheckbox',
                    margin: '0 15 0 0',
                    cls: 'grid-header-checkbox',
                    checked: true
                },
                {
                    boxLabel: 'Show Samples',
                    itemId: 'showSamplesCheckbox',
                    cls: 'grid-header-checkbox',
                    checked: true
                }
                ]
            },
            {
                xtype: 'textfield',
                itemId: 'searchField',
                emptyText: 'Search',
                width: 200
            }
            ]
        },
        store: 'librariesStore',
        columns: {
            items: [
                {
                    text: 'Status',
                    dataIndex: 'status',
                    width: 60,
                    renderer: function(value, meta) {
                        var statusClass = 'status ';

                        // Draw a color circle depending on the status value
                        if (value === -1) {
                            statusClass += 'quality-check-failed';
                            meta.tdAttr = 'data-qtip="Quality failed"';
                        } else if (value === 0) {
                            statusClass += 'pending-submission';
                            meta.tdAttr = 'data-qtip="Pending submission"';
                        } else if (value === 1) {
                            statusClass += 'submission-completed';
                            meta.tdAttr = 'data-qtip="Submission completed"';
                        } else if (value === 2) {
                            statusClass += 'quality-check-approved';
                            meta.tdAttr = 'data-qtip="Quality approved"';
                        } else if (value === 3) {
                            statusClass += 'library-prepared';
                            meta.tdAttr = 'data-qtip="Library prepared"';
                        } else if (value === 4) {
                            statusClass += 'library-pooled';
                            meta.tdAttr = 'data-qtip="Library pooled"';
                        } else if (value === 5) {
                            statusClass += 'sequencing';
                            meta.tdAttr = 'data-qtip="Sequencing"';
                        }
                        return '<div class="' + statusClass + '"></div>';
                    }
                },
                {
                    text: 'Name',
                    dataIndex: 'name',
                    width: 150,
                    renderer: function(val, meta) {
                        meta.tdStyle = 'font-weight:bold';
                        return val;
                    }
                },
                {
                    text: '',
                    dataIndex: 'recordType',
                    width: 30
                },
                {
                    text: 'Barcode',
                    dataIndex: 'barcode',
                    width: 90
                },
                {
                    text: 'Date',
                    dataIndex: 'date'
                },
                {
                    text: 'Nuc. Type',
                    tooltip: 'Nucleic Acid Type',
                    dataIndex: 'nucleicAcidType',
                    width: 100
                },
                {
                    text: 'Protocol',
                    tooltip: 'Library Protocol',
                    dataIndex: 'libraryProtocol',
                    width: 100
                },
                {
                    text: 'Lib. Type',
                    tooltip: 'Library Type',
                    dataIndex: 'libraryType',
                    width: 100
                },
                {
                    text: 'ng/μl',
                    tooltip: 'Concentration',
                    dataIndex: 'concentration',
                    width: 70
                },
                {
                    text: 'RQN',
                    tooltip: 'RNA Quality',
                    dataIndex: 'rnaQualityName',
                    width: 55,
                    renderer: function(val) {
                        var record = Ext.getStore('rnaQualityStore').findRecord('id', val);
                        return (record) ? record.get('name') : '';
                    }
                },
                {
                    text: 'bp',
                    tooltip: 'Mean Fragment Size',
                    dataIndex: 'mean_fragment_size',
                    width: 45
                },
                {
                    text: 'Index Type',
                    dataIndex: 'index_type',
                    width: 100
                },
                {
                    text: '# Index Reads',
                    dataIndex: 'index_reads',
                    width: 100
                },
                {
                    text: 'I7',
                    tooltip: 'Index I7',
                    dataIndex: 'index_i7',
                    width: 100
                },
                {
                    text: 'I5',
                    tooltip: 'Index I5',
                    dataIndex: 'index_i5',
                    width: 100
                },
                {
                    text: 'Length',
                    tooltip: 'Read Length',
                    dataIndex: 'readLength',
                    width: 65
                },
                {
                    text: 'Depth (M)',
                    tooltip: 'Sequencing Depth',
                    dataIndex: 'sequencing_depth',
                    width: 85
                },
                {
                    text: 'Amplification',
                    tooltip: 'Amplification Cycles',
                    dataIndex: 'amplification_cycles',
                    width: 85
                },
                {
                    text: 'Equal nucl.',
                    tooltip: 'Equal Representation of Nucleotides',
                    dataIndex: 'equalRepresentation',
                    width: 90,
                    renderer: function(val) {
                        return val === 'True' ? 'Yes' : 'No';
                    }
                },
                {
                    text: 'qPCR (nM)',
                    tooltip: 'qPCR Result',
                    dataIndex: 'qpcr_result',
                    width: 85
                },
                {
                    text: 'F/S*',
                    tooltip: 'Concentration Method',
                    dataIndex: 'concentrationMethod',
                    width: 50,
                    renderer: function(val) {
                        return val.charAt(0);
                    }
                },
                {
                    text: 'Organism',
                    dataIndex: 'organism',
                    width: 90
                },
                {
                    text: 'Comments',
                    dataIndex: 'comments'
                }
            ]
        },
        features: [{
            ftype: 'grouping',
            groupHeaderTpl: '<strong>Request: {name}</strong> (No. of Libraries/Samples: {rows.length})'
        }],
        plugins: [{
            ptype: 'bufferedrenderer',
            trailingBufferZone: 100,
            leadingBufferZone: 100
        }]
    }]
});
