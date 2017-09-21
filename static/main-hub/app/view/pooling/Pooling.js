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
            title: 'Pooling',
            items: [{
                xtype: 'textfield',
                itemId: 'searchField',
                emptyText: 'Search',
                width: 200
            }]
        },
        padding: 15,
        viewConfig: {
            // loadMask: false,
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
        selModel: {
            type: 'spreadsheet',
            rowSelect: false
        },
        store: 'poolingStore',
        sortableColumns: false,
        columns: [
            {
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
                width: 95,
                renderer: function(value) {
                    var record = Ext.getStore('poolingStore').findRecord('barcode', value);
                    return record ? record.getBarcode() : value;
                }
            },
            {
                text: 'ng/µl',
                tooltip: 'Library Concentration (ng/µl)',
                dataIndex: 'concentration_facility',
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
                        fields: [
                            {
                                name: 'id',
                                type: 'int'
                            },
                            {
                                name: 'name',
                                type: 'string'
                            }
                        ],
                        data: [
                            {
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
                {
                    xtype: 'button',
                    id: 'downloadBenchtopProtocolPBtn',
                    itemId: 'downloadBenchtopProtocolPBtn',
                    text: 'Download Benchtop Protocol',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                },
                {
                    xtype: 'button',
                    id: 'downloadPoolingTemplateBtn',
                    itemId: 'downloadPoolingTemplateBtn',
                    text: 'Download Template QC Normalization and Pooling',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                },
                '->',
                {
                    xtype: 'button',
                    itemId: 'cancelBtn',
                    iconCls: 'fa fa-ban fa-lg',
                    text: 'Cancel'
                },
                {
                    xtype: 'button',
                    itemId: 'saveBtn',
                    iconCls: 'fa fa-floppy-o fa-lg',
                    text: 'Save'
                }
            ]
        }],
        plugins: [
            {
                ptype: 'rowediting',
                clicksToEdit: 1
            },
            {
                ptype: 'bufferedrenderer',
                trailingBufferZone: 100,
                leadingBufferZone: 100
            },
            {
                ptype: 'clipboard'
            }
        ],
        features: [{
            ftype: 'grouping',
            startCollapsed: true,
            groupHeaderTpl: [
                '<strong class="{children:this.getHeaderClass}">' +
                    '{name} | Pool Size: {children:this.getRealPoolSize} M reads ' +
                    '{children:this.getPoolSize}' +
                '</strong>',
                {
                    getHeaderClass: function(children) {
                        var cls = 'pool-header-green';
                        var missingSamples = 0;

                        $.each(children, function(index, item) {
                            if (item.get('sampleId') !== 0 && item.get('status') < 3) {
                                missingSamples++;
                            }
                        });

                        if (missingSamples > 0) cls = 'pool-header-red';

                        return cls;
                    },
                    getRealPoolSize: function(children) {
                        return Ext.sum(Ext.pluck(Ext.pluck(children, 'data'), 'sequencing_depth'));
                    },
                    getPoolSize: function(children) {
                        return '(' + children[0].get('poolSize') + ')';
                    }
                }
            ]
        }]
    }]
});
