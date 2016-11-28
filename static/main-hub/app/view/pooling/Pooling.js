Ext.define('MainHub.view.pooling.Pooling', {
    extend: 'Ext.container.Container',
    xtype: 'pooling',

    requires: [
        'MainHub.view.pooling.PoolingController',
        'Ext.ux.FiddleCheckColumn'
    ],

    controller: 'pooling',

    anchor : '100% -1',
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
            markDirty: false
        },
        plugins: [
            {
                ptype: 'rowediting',
                clicksToEdit: 1,
                autoUpdate: true
            },
            {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            }
        ],
        features: [{
            ftype:'grouping',
            collapsible: false,
            groupHeaderTpl: [
                '<strong>Pool: {name} | Pool size: {children:this.poolSize} M reads | Pool volume: {children:this.poolVolume} {children:this.renderDownloadBtn}</strong>',
                {
                    poolSize: function(children) {
                        return Ext.sum(
                            Ext.pluck(
                                Ext.pluck(children, 'data'), 'sequencingDepth'
                            )
                        );
                    },
                    poolVolume: function(children) {
                        return children.length * 10;
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

        columns: [
            {
                xtype: 'fiddlecheckcolumn',
             	text: 'Active',
                dataIndex: 'active',
                width: 40
            },
            {
                text: 'Request',
                dataIndex: 'requestName',
                flex: 1
            },
            {
                text: 'Library',
                dataIndex: 'name',
                flex: 1
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                width: 90
            },
            {
                text: 'Library Concentration (ng/µl)',
                dataIndex: 'concentration',
                editor: {
                    xtype: 'numberfield',
                    hideTrigger: true,
                    minValue: 1
                },
                flex: 1
            },
            {
                text: 'Mean Fragment Size (bp)',
                dataIndex: 'meanFragmentSize',
                flex: 1
            },
            {
                text: 'Library Concentration C1 (nM)',
                dataIndex: 'concentrationC1',
                editor: {
                    xtype: 'numberfield',
                    minValue: 1
                },
                flex: 1
            },
            {
                text: 'Sequencing Depth (M)',
                dataIndex: 'sequencingDepth',
                flex: 1
            },
            {
                text: 'Normalized Library Concentration C2 (nM)',
                dataIndex: 'concentrationC2',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 1
                },
                flex: 1
            },
            {
                text: 'Sample Volume V1 (µl)',
                dataIndex: 'sampleVolume',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0.1
                },
                flex: 1
            },
            {
                text: 'Buffer Volume V2 (µl)',
                dataIndex: 'bufferVolume',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 1,
                    minValue: 0.1
                },
                flex: 1
            },
            {
                text: '% library in Pool',
                dataIndex: 'percentageLibrary',
                renderer: function(val) {
                    return val + '%';
                },
                flex: 1
            },
            {
                text: 'Volume to Pool',
                dataIndex: 'volumeToPool',
                flex: 1
            },
            {
                text: 'Library QC',
                dataIndex: 'libraryQC'
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
                    disabled: true
                },
                {
                    xtype: 'button',
                    id: 'downloadPoolingTemplateBtn',
                    itemId: 'downloadPoolingTemplateBtn',
                    text: 'Download Template QC Normalization and Pooling',
                    disabled: true
                }
            ]
        }]
    }]
});
