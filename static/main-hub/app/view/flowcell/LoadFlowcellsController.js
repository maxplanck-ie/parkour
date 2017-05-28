Ext.define('MainHub.view.flowcell.LoadFlowcellsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcells',

    requires: [
        'MainHub.view.flowcell.LoadFlowcellWindow',
        'MainHub.view.flowcell.PoolInfoWindow'
    ],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#loadBtn': {
                click: 'onLoadBtnClick'
            },
            '#flowcellsTable': {
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu',
                edit: 'editRecord'
            },
            '#checkColumn': {
                beforecheckchange: 'selectRecord'
            },
            '#downloadBenchtopProtocolFCBtn': {
                click: 'downloadBenchtopProtocol'
            },
            '#downloadSampleSheetBtn': {
                click: 'downloadSampleSheet'
            },
            '#searchField': {
                change: 'search'
            }
        }
    },

    activateView: function() {
        Ext.getStore('flowcellsStore').reload();
    },

    onLoadBtnClick: function() {
        Ext.create('MainHub.view.flowcell.LoadFlowcellWindow').show();
    },

    showContextMenu: function(gridView, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Show Additional Information',
                iconCls: 'x-fa fa-info',
                handler: function() {
                    Ext.create('MainHub.view.flowcell.PoolInfoWindow', {
                        title: record.get('poolName'),
                        poolId: record.get('pool')
                    }).show();
                }
            }, {
                text: 'Apply to All',
                iconCls: 'x-fa fa-check-circle',
                handler: function() {
                    var dataIndex = me.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            }]
        }).showAt(e.getXY());
    },

    showGroupContextMenu: function(view, node, group, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Select All',
                iconCls: 'x-fa fa-check-square-o',
                handler: function() {
                    me.selectAll(group);
                }
            }]
        }).showAt(e.getXY());
    },

    selectRecord: function(cb, rowIndex, checked, record) {
        // Don't select lanes from a different flowcell
        var selectedLane = Ext.getStore('flowcellsStore').findRecord('selected', true);
        if (selectedLane) {
            if (record.get('flowcellId') !== selectedLane.get('flowcellId')) {
                Ext.ux.ToastMessage('You can only select lanes from the same flowcell.', 'warning');
                return false;
            }
        }
    },

    selectAll: function(flowcellId) {
        var store = Ext.getStore('flowcellsStore');
        store.each(function(item) {
            var selectedRecordIndex = store.findBy(function(record) {
                if (record.get('selected') && record.get('flowcellId') !== flowcellId) {
                    return true;
                }
            });

            if (selectedRecordIndex !== -1) return;

            if (item.get('flowcellId') === flowcellId) {
                    item.set('selected', true);
                }
        });
    },

    editRecord: function(editor, context) {
        var record = context.record,
            values = context.newValues,
            url = 'flowcell/update/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,
            params: {
                lane_id: record.get('laneId'),
                name: record.get('laneName'),
                pool: record.get('pool'),
                loading_concentration: record.get('loading_concentration'),
                phix: record.get('phix'),
                qc_result: values.qc_result !== null ? values.qc_result : ''
            },
            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    Ext.getStore('flowcellsStore').reload();
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                }
            },
            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error(response);
            }
        });
    },

    applyToAll: function(record, dataIndex) {
        var store = Ext.getStore('flowcellsStore');
        var allowedColumns = ['loading_concentration', 'phix'];

        if (typeof dataIndex !== 'undefined' && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('flowcell') === record.get('flowcell') && item !== record) {
                    item.set(dataIndex, record.get(dataIndex));
                }
            });
            store.sync({
                failure: function(batch, options) {
                    var error = batch.operations[0].getError();
                    setTimeout(function() {
                        Ext.ux.ToastMessage(error, 'error');
                    }, 100);
                }
            });
        }
    },

    downloadBenchtopProtocol: function() {
        var store = Ext.getStore('flowcellsStore'),
            lanes = {};

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('selected')) {
                lanes[record.get('laneId')] = record.get('flowcell');
            }
        });

        if (Object.keys(lanes).length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'flowcell/download_benchtop_protocol/',
                target: '_blank',
                params: { lanes: Ext.JSON.encode(lanes) }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any lanes.', 'warning');
        }
    },

    downloadSampleSheet: function() {
        var store = Ext.getStore('flowcellsStore'),
            flowcellId = '',
            lanes = [];

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('selected')) {
                lanes.push(record.get('laneId'));
                flowcellId = record.get('flowcell');
            }
        });

        if (Object.keys(lanes).length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'flowcell/download_sample_sheet/',
                target: '_blank',
                params: {
                    flowcell_id: flowcellId,
                    lanes: Ext.JSON.encode(lanes)
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any lanes.', 'warning');
        }
    },

    search: function(fld, query) {
        var grid = Ext.getCmp('flowcellsTable'),
            store = grid.getStore(),
            columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column] && record.data[column].toString().toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });
    },

    getDataIndex: function(e, view) {
        var xPos = e.getXY()[0],
            columns = view.getGridColumns(),
            dataIndex;

        for (var column in columns) {
            var leftEdge = columns[column].getPosition()[0],
                rightEdge = columns[column].getSize().width + leftEdge;

            if (xPos >= leftEdge && xPos <= rightEdge) {
                dataIndex = columns[column].dataIndex;
                break;
            }
        }

        return dataIndex;
    }
});
