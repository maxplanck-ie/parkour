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
        id: 'pooling-grid',
        itemId: 'pooling-grid',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Pooling',
            items: [{
                xtype: 'textfield',
                itemId: 'search-field',
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
                if (record.get('record_type') === 'Sample' && (
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
        enableColumnMove: false,
        columns: [
            {
                xtype: 'checkcolumn',
                itemId: 'check-column',
                dataIndex: 'selected',
                resizable: false,
                menuDisabled: true,
                hideable: false,
                tdCls: 'no-dirty',
                width: 40
            },
            {
                text: 'Request',
                tooltip: 'Request ID',
                dataIndex: 'request_name',
                menuDisabled: true,
                hideable: false,
                minWidth: 200,
                flex: 1
            },
            {
                text: 'Name',
                tooltip: 'Library Name',
                dataIndex: 'name',
                menuDisabled: true,
                hideable: false,
                minWidth: 200,
                flex: 1
            },
            {
                text: 'Barcode',
                dataIndex: 'barcode',
                resizable: false,
                menuDisabled: true,
                hideable: false,
                width: 95,
                renderer: function(value) {
                    var record = Ext.getStore('poolingStore').findRecord('barcode', value);
                    return record ? record.getBarcode() : value;
                }
            },
            {
                text: 'Date',
                dataIndex: 'create_time',
                width: 90,
                renderer: Ext.util.Format.dateRenderer('d.m.Y')
            },
            {
                text: 'ng/µl',
                tooltip: 'Concentration Library (ng/µl)',
                dataIndex: 'concentration_library',
                width: 100
            },
            {
                text: 'bp',
                tooltip: 'Mean Fragment Size (bp)',
                dataIndex: 'mean_fragment_size',
                width: 75
            },
            {
                text: 'I7 ID',
                tooltip: 'Index I7 ID',
                dataIndex: 'index_i7_id',
                width: 90
            },
            {
                text: 'Index I7',
                dataIndex: 'index_i7',
                width: 90
            },
            {
                text: 'I5 ID',
                tooltip: 'Index I5 ID',
                dataIndex: 'index_i5_id',
                width: 90
            },
            {
                text: 'Index I5',
                dataIndex: 'index_i5',
                width: 90
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
                width: 55
            },
            {
                text: 'QC Result',
                dataIndex: 'quality_check',
                resizable: false,
                menuDisabled: true,
                hideable: false,
                width: 90,
                editor: {
                    xtype: 'combobox',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'name',
                    store: Ext.create('Ext.data.Store', {
                        fields: [{
                            name: 'name',
                            type: 'string'
                        }],
                        data: [{
                            name: 'passed'
                        },
                        {
                            name: 'failed'
                        }]
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
                    itemId: 'download-benchtop-protocol-button',
                    text: 'Download Benchtop Protocol',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                    // disabled: true
                },
                {
                    xtype: 'button',
                    itemId: 'download-pooling-template-button',
                    text: 'Download Template QC Normalization and Pooling',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                    // disabled: true
                },
                '->',
                {
                    xtype: 'button',
                    itemId: 'cancel-button',
                    iconCls: 'fa fa-ban fa-lg',
                    text: 'Cancel'
                },
                {
                    xtype: 'button',
                    itemId: 'save-button',
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
            enableGroupingMenu: false,
            groupHeaderTpl: [
                '<strong class="{children:this.getHeaderClass}">' +
                    '{children:this.getName} | Pool Size: {children:this.getRealPoolSize} M reads ' +
                    '{children:this.getPoolSize}' +
                '</strong>',
                {
                    getHeaderClass: function(children) {
                        var cls = 'pool-header-green';
                        var numMissingSamples = 0;

                        Ext.each(children, function(item, index) {
                            if (item.get('record_type') === 'Sample' && item.get('status') < 3) {
                                numMissingSamples++;
                            }
                        });

                        if (numMissingSamples > 0) {
                            cls = 'pool-header-red';
                        }

                        return cls;
                    },
                    getName: function(children) {
                        return children[0].get('pool_name');
                    },
                    getRealPoolSize: function(children) {
                        return Ext.sum(Ext.pluck(Ext.pluck(children, 'data'), 'sequencing_depth'));
                    },
                    getPoolSize: function(children) {
                        return '(' + children[0].get('pool_size') + ')';
                    }
                }
            ]
        }]
    }]
});
