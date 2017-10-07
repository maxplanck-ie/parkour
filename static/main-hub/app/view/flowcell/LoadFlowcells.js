Ext.define('MainHub.view.flowcell.LoadFlowcells', {
    extend: 'Ext.container.Container',
    xtype: 'load-flowcells',
    requires: ['MainHub.view.flowcell.LoadFlowcellsController'],
    controller: 'load-flowcells',

    anchor: '100% -1',
    layout: 'fit',

    items: [{
        xtype: 'grid',
        id: 'flowcellsTable',
        itemId: 'flowcellsTable',
        height: Ext.Element.getViewportHeight() - 64,
        header: {
            title: 'Load Flowcells',
            items: [{
                xtype: 'textfield',
                itemId: 'searchField',
                emptyText: 'Search',
                width: 200
            }, {
                xtype: 'button',
                itemId: 'loadBtn',
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
            itemId: 'checkColumn',
            dataIndex: 'selected',
            resizable: false,
            menuDisabled: true,
            hideable: false,
            tdCls: 'no-dirty',
            width: 40
        }, {
            text: 'Lane',
            dataIndex: 'laneName',
            menuDisabled: true,
            hideable: false,
            flex: 1
        }, {
            text: 'Pool',
            dataIndex: 'poolName',
            menuDisabled: true,
            hideable: false,
            flex: 1
        }, {
            text: 'Length',
            tooltip: 'Read Length',
            dataIndex: 'readLengthName',
            flex: 1
        }, {
            text: 'Index I7',
            dataIndex: 'indexI7Show',
            flex: 1
        }, {
            text: 'Index I5',
            dataIndex: 'indexI5Show',
            flex: 1
        }, {
            text: 'Sequencer',
            dataIndex: 'sequencerName',
            flex: 1
        }, {
            text: 'Equal nucl.',
            tooltip: 'Equal Representation of Nucleotides',
            dataIndex: 'equalRepresentation',
            flex: 1
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
            dataIndex: 'qc_result',
            resizable: false,
            menuDisabled: true,
            hideable: false,
            editor: {
                xtype: 'combobox',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                store: Ext.create('Ext.data.Store', {
                    fields: [{
                        name: 'name',
                        type: 'string'
                    }, {
                        name: 'value',
                        type: 'bool'
                    }],
                    data: [{
                        name: 'completed',
                        value: true
                    }]
                }),
                forceSelection: true
            }
        }],
        features: [{
            ftype: 'grouping',
            startCollapsed: true,
            groupHeaderTpl: [
                '<strong>Flowcell ID: {children:this.getFlowcellId}</strong>',
                {
                    getFlowcellId: function(children) {
                        return children[0].get('flowcellId')
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
                    itemId: 'downloadBenchtopProtocolFCBtn',
                    text: 'Download Benchtop Protocol',
                    iconCls: 'fa fa-file-excel-o fa-lg'
                },
                {
                    xtype: 'button',
                    itemId: 'downloadSampleSheetBtn',
                    text: 'Download Sample Sheet',
                    iconCls: 'fa fa-file-text-o fa-lg'
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
        }]
    }]
});
