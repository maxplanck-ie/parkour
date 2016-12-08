Ext.define('MainHub.view.flowcell.LoadFlowcellWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcell-window',

    requires: ['MainHub.view.flowcell.PoolInfoWindow'],

    config: {
        control: {
            '#sequencer': {
                change: 'onSequencerChange'
            },
            '#poolsFlowcell': {
                render: 'initializePoolDragZone',
                itemcontextmenu: 'showContextMenu'
            }
        }
    },

    onSequencerChange: function(cb, newValue, oldValue) {
        var me = this,
            lanes = Ext.getCmp('lanes'),
            store = Ext.getStore('poolsStore');

        // If HiSeq2500 has been selected, create 8 lanes
        if (newValue == 5) {
            lanes.removeAll(true);

            for (var i = 1; i < 9; i++) {
                lanes.add({
                    cls: 'lane',
                    html: 'Lane ' + i,
                    id: 'lane' + i,
                    width: 85,
                    listeners: {
                        render: me.initializeLaneDropZone
                    }
                });
            }
        } else {
            lanes.removeAll(true);

            lanes.add({
                cls: 'lane',
                html: 'Lane 1',
                id: 'lane1',
                width: 145,
                listeners: {
                    render: me.initializeLaneDropZone
                }
            });
        }

        // Clear all loaded pools
        store.each(function(pool) {
            if (pool.get('lane')) {
                pool.set({
                    lane: '',
                    laneName: ''
                });
            }
        });
    },

    initializePoolDragZone: function(v) {
        v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
            getDragData: function(e) {
                var sourceEl = $(e.item).find('td div')[0], d;
                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return (v.dragData = {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d,
                        poolData: v.getStore().getAt(e.recordIndex).data
                    });
                }
            },

            getRepairXY: function() {
                return this.dragData.repairXY;
            }
        });
    },

    initializeLaneDropZone: function(v) {
        function allowPool(record, store) {
            var loadedPools = [];

            store.each(function(pool) {
                if (pool.get('lane')) loadedPools.push(pool);
            });

            // return loadedPools.length === 0 || (loadedPools.length > 0 && record.get('sequencingRunCondition') === loadedPools[0].get('sequencingRunCondition'));
            return true;
        }

        function allowLane(record, laneId, store) {
            var ids = Ext.Array.pluck(Ext.Array.pluck(store.data.items, 'data'), 'lane');
            return !ids || (record.get('lane') === '' && Ext.Array.indexOf(ids, laneId) === -1);
        }

        v.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
            getTargetFromEvent: function(e) {
                return e.getTarget();
            },

            // onNodeEnter : function(target, dd, e, data) {
            //     Ext.fly(target).addCls('lane-hover');
            // },
            //
            // onNodeOut : function(target, dd, e, data) {
            //     Ext.fly(target).removeCls('lane-hover');
            // },

            onNodeOver : function(target, dd, e, data) {
                var store = Ext.getStore('poolsStore'),
                    poolRecord = store.findRecord('name', data.poolData.name),
                    laneId = $(target).attr('id').replace('-innerCt', ''),
                    proto = Ext.dd.DropZone.prototype;
                return (allowLane(poolRecord, laneId, store) && allowPool(poolRecord, store)) ? proto.dropAllowed : proto.dropNotAllowed;
            },

            onNodeDrop : function(target, dd, e, data) {
                var poolData = data.poolData,
                    store = Ext.getStore('poolsStore'),
                    poolRecord = store.findRecord('name', poolData.name),
                    laneId = $(target).attr('id').replace('-innerCt', ''),
                    laneName = $(target).text(),
                    ids = Ext.Array.pluck(Ext.Array.pluck(store.data.items, 'data'), 'lane');

                if (allowLane(poolRecord, laneId, store)) {
                    if (allowPool(poolRecord, store)) {
                        poolRecord.set({
                            lane: laneId,
                            laneName: laneName
                        });

                        Ext.fly(target).addCls('lane-loaded');

                        return true;
                    } else {
                        Ext.ux.ToastMessage('Read Lengths must be the same for all pools in a flowcell.', 'warning');
                    }
                } else {
                    if (poolRecord.get('lane') && poolRecord.get('lane') !== laneId) {
                        Ext.ux.ToastMessage('Pool ' + poolData.name + ' is already loaded on a lane. Please unload it and try again.', 'warning');
                    } else if(!poolRecord.get('lane') && Ext.Array.indexOf(ids, laneId) !== -1) {
                        Ext.ux.ToastMessage(laneName + ' is already loaded. Please unload it and try again.', 'warning');
                    }
                }

                return false;
            }
        });
    },

    showContextMenu: function(grid, record, item, index, e) {
        var me = this;

        var items = [{
            text: 'Show Additional Information',
            iconCls: 'x-fa fa-info',
            handler: function() {
                Ext.create('MainHub.view.flowcell.PoolInfoWindow', {
                    title: record.get('name'),
                    poolId: record.get('id')
                }).show();
            }
        }];

        // If a pool is already loaded on a lane
        if (record.get('lane')) {
            items.push({
                text: 'Unload Lane',
                iconCls: 'x-fa fa-eraser',
                handler: function() {
                    me.unloadLane(record);
                }
            });
        }

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: items
        }).showAt(e.getXY());
    },

    unloadLane: function(pool) {
        Ext.fly(record.get('lane') + '-innerCt').removeCls('lane-loaded');

        pool.set({
            lane: '',
            laneName: ''
        });
    }
});
