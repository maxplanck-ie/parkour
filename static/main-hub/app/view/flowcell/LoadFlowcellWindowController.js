Ext.define('MainHub.view.flowcell.LoadFlowcellWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcell-window',

    requires: [],

    config: {
        control: {
            '#sequencer': {
                change: 'onSequencerChange'
            },
            '#poolsFlowcell': {
                render: 'initializePoolDragZone'
            }
        }
    },

    onSequencerChange: function(cb, newValue, oldValue) {
        var me = this,
            lanes = Ext.getCmp('lanes');

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
        v.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
            getTargetFromEvent: function(e) {
                return e.getTarget();
            },

            onNodeEnter : function(target, dd, e, data) {
                Ext.fly(target).addCls('lane-hover');
            },

            onNodeOut : function(target, dd, e, data) {
                Ext.fly(target).removeCls('lane-hover');
            },

            // onNodeOver : function(target, dd, e, data){
            //     debugger;
            // },

            onNodeDrop : function(target, dd, e, data){
                var poolData = data.poolData;

                // debugger;

                return false;
            }
        });
    }
});
