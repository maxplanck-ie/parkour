Ext.define('MainHub.view.pooling.Pooling', {
    extend: 'Ext.container.Container',
    xtype: 'pooling',

    requires: [
        'MainHub.view.pooling.PoolingController',
        'Ext.ux.FiddleCheckColumn'
    ],

    controller: 'pooling',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'poolingTable',
        itemId: 'poolingTable',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Pooling'
        },
        padding: 15,
        viewConfig: {
            loadMask: false,
            // markDirty: false,
            stripeRows: false,
            getRowClass: function(record) {
                var rowClass = '';
                if (record.get('sampleId') !== 0 && (
                    record.get('status') === 2 || record.get('status') === -2)) {
                    rowClass = 'library-not-prepared';
                }
                return rowClass;
            }
        },
        plugins: [{
                ptype: 'rowediting',
                clicksToEdit: 1
            },
            {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            }
        ],
        features: [{
            ftype: 'grouping',
            collapsible: false,
            groupHeaderTpl: [
                '<strong>{name} | Pool Size: {children:this.poolSize} M reads {children:this.renderDownloadBtn}</strong>',
                {
                    poolSize: function(children) {
                        return Ext.sum(Ext.pluck(Ext.pluck(children, 'data'), 'sequencing_depth'));
                    },
                    renderDownloadBtn: function(children) {
                        var url = children[0].get('file');
                        return (url !== '') ? '<span class="download-pooling-template"><a href="' + url +
                            '">' + '<i class="fa fa-download" aria-hidden="true"></i></a></span>' : '';
                    }
                }
            ]
        }],
        store: 'poolingStore',
        sortableColumns: false,
        columns: [{
                xtype: 'checkcolumn',
                itemId: 'checkColumn',
                dataIndex: 'selected',
                tdCls: 'no-dirty',
                width: 40
            },
            {
                text: 'Request',
                tooltip: 'Request ID',
                dataIndex: 'requestName',
                minWidth: 200,
                flex: 1
            },
            {
                text: 'Library',
                tooltip: 'Library Name',
                dataIndex: 'name',
                minWidth: 200,
                flex: 1
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                width: 90
            },
            {
                text: 'ng/µl',
                tooltip: 'Library Concentration (ng/µl)',
                dataIndex: 'concentration',
                // editor: {
                //     xtype: 'numberfield',
                //     // hideTrigger: true,
                //     decimalPrecision: 1,
                //     minValue: 0
                // },
                width: 100
            },
            {
                text: 'bp',
                tooltip: 'Mean Fragment Size (bp)',
                dataIndex: 'mean_fragment_size',
                width: 75
            },
            {
                text: 'nM C1',
                tooltip: 'Library Concentration C1 (nM)',
                dataIndex: 'concentration_c1',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0
                },
                width: 100
            },
            {
                text: 'Depth (M)',
                tooltip: 'Sequencing Depth (M)',
                dataIndex: 'sequencing_depth',
                width: 90
            },
            {
                text: '%',
                tooltip: '% library in Pool',
                dataIndex: 'percentage_library',
                renderer: function(val) {
                    return val + '%';
                },
                width: 55
            },
            {
                text: 'QC Result',
                dataIndex: 'qc_result',
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    store: Ext.create('Ext.data.Store', {
                        fields: [{
                                name: 'id',
                                type: 'int'
                            },
                            {
                                name: 'name',
                                type: 'string'
                            }
                        ],
                        data: [{
                                id: 1,
                                name: 'passed'
                            },
                            {
                                id: 2,
                                name: 'failed'
                            }
                        ]
                    }),
                    forceSelection: true
                }
            }
        ],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
                '->',
                {
                    xtype: 'button',
                    id: 'downloadBenchtopProtocolPBtn',
                    itemId: 'downloadBenchtopProtocolPBtn',
                    text: 'Download Benchtop Protocol',
                    iconCls: 'fa fa-file-excel-o fa-lg',
                    disabled: true
                },
                {
                    xtype: 'button',
                    id: 'downloadPoolingTemplateBtn',
                    itemId: 'downloadPoolingTemplateBtn',
                    text: 'Download Template QC Normalization and Pooling',
                    iconCls: 'fa fa-file-excel-o fa-lg',
                    disabled: true
                }
            ]
        }]
    }]
});
