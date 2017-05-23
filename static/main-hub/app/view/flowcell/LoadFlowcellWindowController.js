Ext.define('MainHub.view.flowcell.LoadFlowcellWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcell-window',

    config: {
        control: {
            '#': {
                boxready: 'onWindowReady',
                beforeclose: 'onWindowClose'
            },
            '#sequencerField': {
                change: 'changeSequencer'
            },
            '#poolsFlowcell': {
                render: 'initializePoolDragZone',
                itemcontextmenu: 'showAdditionalInformationMenu'
            },
            '#flowcellResultGrid': {
                // select: 'selectLane',
                itemcontextmenu: 'showUnloadLaneMenu'
            },
            '#saveBtn': {
                click: 'save'
            }
        }
    },

    onWindowReady: function() {
        Ext.getStore('lanesStore').removeAll();
        Ext.getStore('poolsStore').load();
    },

    onWindowClose: function() {
        Ext.getCmp('poolsFlowcell').dragZone.destroy();
    },

    changeSequencer: function(cb, newValue, oldValue) {
        var me = this,
            lanes = Ext.getCmp('lanes'),
            lanesStore = Ext.getStore('lanesStore'),
            sequencersStore = Ext.getStore('sequencersStore');

        lanes.removeAll(true);
        lanesStore.removeAll();

        var sequencer = sequencersStore.findRecord('id', newValue);
        if (sequencer) {
            var numLanes = sequencer.get('lanes');
            var laneTileWidth = numLanes === 1 ? 145 : 82;
            for (var i = 0; i < numLanes; i++) {
                lanes.add({
                    cls: 'lane',
                    html: 'Lane ' + (i + 1),
                    id: 'lane' + (i + 1),
                    width: laneTileWidth,
                    listeners: {
                        render: me.initializeLaneDropZone
                    }
                });
            }
        }

        // Get original Pool Loaded values
        if (oldValue) Ext.getStore('poolsStore').reload();
    },

    showAdditionalInformationMenu: function(grid, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Show Additional Information',
                iconCls: 'x-fa fa-info',
                handler: function() {
                    Ext.create('MainHub.view.flowcell.PoolInfoWindow', {
                        title: record.get('name'),
                        poolId: record.get('id')
                    }).show();
                }
            }]
        }).showAt(e.getXY());
    },

    clickLane: function(e) {
        var laneId = this.id,
            wnd = this.component.up('window'),
            grid = Ext.getCmp('flowcellResultGrid'),
            poolsStore = Ext.getStore('poolsStore'),
            lanesStore = Ext.getStore('lanesStore');
            // field = Ext.getCmp('loadingConcentrationField');

        if ($(this.dom).find('.lane-loaded').length === 1) {
            var record = lanesStore.findRecord('lane', laneId);

            // Highlight an active lane in the result grid
            grid.getSelectionModel().select(lanesStore.indexOf(record));

            // Disable Loading Concentration field and set its value
            // wnd.getController().updateConcentrationField(record);
        } else {
            grid.getSelectionModel().deselectAll();
            // field.fireEvent('clear', field);
        }
    },

    initializePoolDragZone: function(v) {
        v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
            onBeforeDrag: function(data, e) {
                var record = v.getStore().getAt(e.recordIndex);
                return !record.isDisabled();
            },

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
        // Initialize 'click' event
        v.el.on('click', this.up('window').getController().clickLane);

        function isLoaded(lane, store) {
            return store.findRecord('lane', lane) !== null;
        }

        function isSizeMatch(poolSize, sequencer) {
            return sequencer.get('laneCapacity') >= poolSize.get('size');
        }

        function isReadLengthOK(pool, lanesStore, poolsStore) {
            if (lanesStore.getCount() > 0) {
                var poolInResultId = lanesStore.getAt(0).get('pool'),
                    poolInResultRecord = poolsStore.findRecord('id', poolInResultId);
                if (poolInResultRecord.get('readLength') != pool.get('readLength')) {
                    return false;
                }
            }
            return true;
        }

        function isTargetingSelf(targetLane, pool, store) {
            var ids = [];
            store.each(function(record) {
                if (record.get('pool') == pool.get('id')) {
                    ids.push(record.get('lane'));
                }
            });
            return ids.indexOf(targetLane) !== -1;
        }

        v.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
            getTargetFromEvent: function(e) {
                return e.getTarget();
            },

            onNodeOver: function(target, dd, e, data) {
                var lanesStore = Ext.getStore('lanesStore'),
                    poolsStore = Ext.getStore('poolsStore'),
                    pool = poolsStore.findRecord('name', data.poolData.name),
                    poolSize = Ext.getStore('poolSizesStore').findRecord('id', pool.get('poolSizeId')),
                    laneId = $(target).attr('id').replace('-innerCt', ''),
                    sequencerId = Ext.getCmp('sequencerField').getValue(),
                    sequencer = Ext.getStore('sequencersStore').findRecord('id', sequencerId),
                    proto = Ext.dd.DropZone.prototype;
                return (!isLoaded(laneId, lanesStore) && isReadLengthOK(pool, lanesStore, poolsStore) && isSizeMatch(poolSize, sequencer)) ? proto.dropAllowed : proto.dropNotAllowed;
            },

            onNodeDrop: function(target, dd, e, data) {
                var poolData = data.poolData,
                    poolsStore = Ext.getStore('poolsStore'),
                    lanesStore = Ext.getStore('lanesStore'),
                    pool = poolsStore.findRecord('name', poolData.name),
                    poolSize = Ext.getStore('poolSizesStore').findRecord('id', pool.get('poolSizeId')),
                    laneId = $(target).attr('id').replace('-innerCt', ''),
                    laneName = $(target).text(),
                    sequencerId = Ext.getCmp('sequencerField').getValue(),
                    sequencer = Ext.getStore('sequencersStore').findRecord('id', sequencerId),
                    laneCapacity = sequencer.get('laneCapacity');

                // If a target lane is not loaded
                if (!isLoaded(laneId, lanesStore)) {

                    // Is the Read Length the same for all pools
                    if (!isReadLengthOK(pool, lanesStore, poolsStore)) {
                        Ext.ux.ToastMessage('Read Length must be the same for all pools on a flowcell.', 'warning');
                        return false;
                    }

                    if (!isSizeMatch(poolSize, sequencer)) {
                        Ext.ux.ToastMessage(
                            'Pool with size ' + poolSize.get('size') +
                            ' cannot be fit on a lane with capacity ' + sequencer.get('laneCapacity'),
                        'warning');
                        return false;
                    }

                    // Load the pool on a lane
                    lanesStore.add({
                        pool: pool.get('id'),
                        poolName: pool.get('name'),
                        lane: laneId,
                        laneName: laneName
                    });

                    pool.set('loaded', pool.get('loaded') + 1);

                    // Disable the pool
                    if (pool.get('loaded') == poolSize) {
                        pool.setDisabled(true);
                    }

                    Ext.fly(target).addCls('lane-loaded');
                    Ext.getCmp('poolsFlowcell').getView().refresh();

                    return true;
                }
                // If a target lane is loaded
                else {
                    // If a target lane and the loaded pool's lane are not the same
                    if (!isTargetingSelf(laneId, pool, lanesStore)) {
                        Ext.ux.ToastMessage(laneName + ' is already loaded. Please unload it and try again.', 'warning');
                    }
                }

                return false;
            }
        });
    },

    showUnloadLaneMenu: function(grid, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Unload Lane',
                iconCls: 'x-fa fa-eraser',
                handler: function() {
                    me.unloadLane(grid.getStore(), record);
                }
            }]
        }).showAt(e.getXY());
    },

    unloadLane: function(lanesStore, record) {
        var poolsStore = Ext.getStore('poolsStore'),
            pool = poolsStore.findRecord('id', record.get('pool'));

        // Update (increase) Pool Loaded amount
        pool.set('loaded', pool.get('loaded') - record.get('loaded'));

        Ext.fly(record.get('lane') + '-innerCt').removeCls('lane-loaded');
        lanesStore.remove(record);

        // Enable Pool for loading
        if (pool.get('size') != pool.get('loaded')) {
            pool.setDisabled(false);
        }
    },

    save: function(btn) {
        var wnd = btn.up('window'),
            lanesStore = Ext.getStore('lanesStore'),
            form = Ext.getCmp('flowcellForm').getForm(),
            laneContainers = Ext.getCmp('lanes').items.items;

        if (form.isValid()) {
            // If all lanes are loaded
            if (lanesStore.getCount() == laneContainers.length) {
                var lanes = [];
                lanesStore.each(function(lane) {
                    lanes.push({
                        name: lane.get('laneName'),
                        pool_id: lane.get('pool')
                    });
                });

                form.submit({
                    url: 'flowcell/save/',
                    params: {
                        lanes: Ext.JSON.encode(lanes)
                    },
                    success: function(f, action) {
                        if (action.result.success) {
                            Ext.ux.ToastMessage('Flowcell has been successfully loaded!');
                            Ext.getStore('flowcellsStore').reload();
                            wnd.close();
                        } else {
                            Ext.ux.ToastMessage(action.result.error, 'error');
                        }
                    },
                    failure: function(f, action) {
                        Ext.ux.ToastMessage(action.result.error, 'error');
                    }
                });
            } else {
                Ext.ux.ToastMessage('All lanes must be loaded.', 'warning');
            }
        } else {
            Ext.ux.ToastMessage('Flowcell ID is not set.', 'warning');
        }
    }
});
