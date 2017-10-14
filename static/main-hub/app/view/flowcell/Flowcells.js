Ext.define('MainHub.view.flowcell.Flowcells', {
    extend: 'Ext.container.Container',
    xtype: 'flowcells',
    requires: ['MainHub.view.flowcell.FlowcellsController'],
    controller: 'flowcells',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'flowcells-grid',
        itemId: 'flowcells-grid',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Load Flowcells',
            items: [{
                xtype: 'textfield',
                itemId: 'search-field',
                emptyText: 'Search',
                margin: '0 15px 0 0',
                width: 200
            }, {
                xtype: 'button',
                itemId: 'load-button',
                text: 'Load'
            }]
        },
        padding: 15,
        viewConfig: {
            // loadMask: false,
            stripeRows: false
        },
        selModel: {
            type: 'spreadsheet',
            rowSelect: false
        },
        store: 'flowcellsStore',
        sortableColumns: false,
        enableColumnMove: false,
        columns: [{
            xtype: 'checkcolumn',
            itemId: 'check-column',
            dataIndex: 'selected',
            resizable: false,
            menuDisabled: true,
            hideable: false,
            tdCls: 'no-dirty',
            width: 40
        }, {
            text: 'Lane',
            dataIndex: 'name',
            menuDisabled: true,
            hideable: false,
            flex: 1
        }, {
            text: 'Pool',
            dataIndex: 'pool_name',
            menuDisabled: true,
            hideable: false,
            flex: 1
        }, {
            text: 'Date',
            dataIndex: 'create_time',
            // width: 90,
            flex: 1,
            renderer: Ext.util.Format.dateRenderer('d.m.Y')
        }, {
            text: 'Length',
            tooltip: 'Read Length',
            dataIndex: 'read_length_name',
            flex: 1
        }, {
            text: 'Index I7',
            dataIndex: 'index_i7_show',
            flex: 1,
            renderer: function(value) {
                return value ? 'Yes' : 'No';
            }
        }, {
            text: 'Index I5',
            dataIndex: 'index_i5_show',
            flex: 1,
            renderer: function(value) {
                return value ? 'Yes' : 'No';
            }
        }, {
            text: 'Sequencer',
            dataIndex: 'sequencer_name',
            flex: 1
        }, {
            text: 'Equal nucl.',
            tooltip: 'Equal Representation of Nucleotides',
            dataIndex: 'equal_representation',
            flex: 1,
            renderer: function(value) {
                return value ? 'Yes' : 'No';
            }
        }, {
            text: 'Loading Conc.',
            tooltip: 'Loading Concentration',
            dataIndex: 'loading_concentration',
            flex: 1,
            editor: {
                xtype: 'numberfield',
                decimalPrecision: 1,
                minValue: 0
            }
        }, {
            text: 'PhiX %',
            dataIndex: 'phix',
            flex: 1,
            editor: {
                xtype: 'numberfield',
                decimalPrecision: 1,
                minValue: 0
            }
        }, {
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
                        name: 'completed'
                    }]
                }),
                forceSelection: true
            }
        }],
        features: [{
            ftype: 'grouping',
            startCollapsed: true,
            enableGroupingMenu: false,
            groupHeaderTpl: [
                '<strong>Flowcell ID: {children:this.getFlowcellId}</strong>',
                {
                    getFlowcellId: function(children) {
                        return children[0].get('flowcell_id')
                    }
                }
            ]
        }],
        plugins: [{
            ptype: 'bufferedrenderer',
            trailingBufferZone: 100,
            leadingBufferZone: 100
        }, {
            ptype: 'rowediting',
            clicksToEdit: 1
        }, {
            ptype: 'clipboard'
        }],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
                {
                    xtype: 'button',
                    itemId: 'download-benchtop-protocol-button',
                    text: 'Download Benchtop Protocol',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                },
                {
                    xtype: 'button',
                    itemId: 'download-sample-sheet-button',
                    text: 'Download Sample Sheet',
                    iconCls: 'fa fa-file-text-o fa-lg'
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
        }]
    }]
});
