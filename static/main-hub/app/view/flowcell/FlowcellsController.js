Ext.define('MainHub.view.flowcell.FlowcellsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.flowcells',

    requires: [
        'MainHub.view.flowcell.FlowcellWindow',
        'MainHub.view.flowcell.PoolInfoWindow'
    ],

    mixins: [
        'MainHub.grid.SearchInputMixin',
        'MainHub.store.SyncStoreMixin'
    ],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#load-button': {
                click: 'onLoadBtnClick'
            },
            '#flowcells-grid': {
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu',
                edit: 'editRecord'
            },
            '#check-column': {
                beforecheckchange: 'selectRecord'
            },
            '#download-benchtop-protocol-button': {
                click: 'downloadBenchtopProtocol'
            },
            '#download-sample-sheet-button': {
                click: 'downloadSampleSheet'
            },
            '#search-field': {
                change: 'changeFilter'
            },
            '#cancel-button': {
                click: 'cancel'
            },
            '#save-button': {
                click: 'save'
            }
        }
    },

    activateView: function() {
        Ext.getStore('flowcellsStore').reload();
    },

    onLoadBtnClick: function() {
        Ext.create('MainHub.view.flowcell.FlowcellWindow');
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
                        title: record.get('pool_name'),
                        poolId: record.get('pool')
                    });
                }
            }, {
                text: 'Apply to All',
                iconCls: 'x-fa fa-check-circle',
                handler: function() {
                    var dataIndex = MainHub.Utilities.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            }]
        }).showAt(e.getXY());
    },

    showGroupContextMenu: function(view, node, groupId, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Select All',
                iconCls: 'x-fa fa-check-square-o',
                handler: function() {
                    me.selectUnselectAll(parseInt(groupId), true);
                }
            }, {
                text: 'Unselect All',
                iconCls: 'x-fa fa-square-o',
                handler: function() {
                    me.selectUnselectAll(parseInt(groupId), false);
                }
            }, '-', {
                text: 'QC: All selected completed',
                iconCls: 'x-fa fa-check',
                handler: function() {
                    me.qualityCheckAll(parseInt(groupId), 'completed');
                }
            }]
        }).showAt(e.getXY());
    },

    selectRecord: function(cb, rowIndex, checked, record) {
        // Don't select lanes from a different flowcell
        var selectedLane = Ext.getStore('flowcellsStore').findRecord('selected', true);
        if (selectedLane) {
            if (record.get('flowcell') !== selectedLane.get('flowcell')) {
                new Noty({
                    text: 'You can only select lanes from the same flowcell.',
                    type: 'warning'
                }).show();
            }
        }
    },

    selectUnselectAll: function(flowcell, selected) {
        var store = Ext.getStore('flowcellsStore');

        store.each(function(item) {
            if (item.get('flowcell') === flowcell) {
                item.set('selected', selected);
            }
        });
    },

    editRecord: function(editor, context) {
        var record = context.record;
        var changes = record.getChanges();
        var reload = Object.keys(changes).indexOf('quality_check') !== -1;

        // Send the changes to the server
        this.syncStore('flowcellsStore', reload);
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

            // Send the changes to the server
            this.syncStore('flowcellsStore');
        }
    },

    downloadBenchtopProtocol: function() {
        var store = Ext.getStore('flowcellsStore');
        var ids = []

        // Get all checked (selected) records
        store.each(function(record) {
            if (record.get('selected')) {
                ids.push(record.get('pk'));
            }
        });

        if (ids.length === 0) {
            new Noty({
                text: 'You did not select any lanes.',
                type: 'warning'
            }).show();
            return;
        }

        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true
        });

        form.submit({
            url: 'api/flowcells/download_benchtop_protocol/',
            params: {
                'ids': Ext.JSON.encode(ids)
            }
        });
    },

    downloadSampleSheet: function() {
        var store = Ext.getStore('flowcellsStore');
        var flowcellId = '';
        var ids = [];

        // Get all checked (selected) samples
        store.each(function(record) {
            if (record.get('selected')) {
                ids.push(record.get('pk'));
                flowcellId = record.get('flowcell');
            }
        });

        if (ids.length === 0) {
            new Noty({
                text: 'You did not select any lanes.',
                type: 'warning'
            }).show();
            return;
        }

        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true
        });

        form.submit({
            url: 'api/flowcells/download_sample_sheet/',
            params: {
                'ids': Ext.JSON.encode(ids),
                'flowcell_id': flowcellId
            }
        });
    },

    save: function() {
        // Send the changes to the server
        this.syncStore('flowcellsStore');
    },

    cancel: function() {
        Ext.getStore('flowcellsStore').rejectChanges();
    }
});
