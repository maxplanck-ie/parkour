Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    requires: [],

    config: {
        control: {
            '#poolingTreePanel': {
                checkchange: 'onPoolingTreePanelCheckchange'
            },
            '#poolSize': {
                boxready: 'onMaxPoolSizeBoxready'
            },
            '#poolGrid': {
                edit: 'onSequenceDepthEdit'
            },
            '#savePool': {
                click: 'savePool'
            }
        }
    },

    onMaxPoolSizeBoxready: function(cb) {
        cb.select(25, true);
    },

    onPoolingTreePanelCheckchange: function(node, checked) {
        var grid = Ext.getCmp('poolGrid'),
            store = grid.getStore();

        if (checked) {
            if (this.isUnique(store, node) && this.isCompatible(store, node) &&
                this.isColorDiversityMaximized(store, node) && this.isPoolSizeOk(store, node)) {

                var indexI7Sequence = node.get('indexI7'),
                    indexI7 = indexI7Sequence.split('');
                if (indexI7Sequence.length == 6) {
                    $.merge(indexI7, [' ', ' ']);
                }

                var indexI5Sequence = node.get('indexI5'),
                    indexI5 = indexI5Sequence.split('');
                if (indexI5Sequence.length === 0) {
                    indexI5 = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
                } else if (indexI5Sequence.length == 6) {
                    $.merge(indexI5, [' ', ' ']);
                }

                store.add({
                    name: node.get('text'),
                    libraryId: node.get('libraryId'),
                    sequencingDepth: node.get('sequencingDepth'),
                    sequencingRunCondition: node.get('sequencingRunCondition'),
                    indexI7: indexI7Sequence,
                    indexI5: indexI5Sequence,
                    indexI7Id: node.get('indexI7Id'),
                    indexI5Id: node.get('indexI5Id'),
                    indexI7_1: indexI7[0],
                    indexI7_2: indexI7[1],
                    indexI7_3: indexI7[2],
                    indexI7_4: indexI7[3],
                    indexI7_5: indexI7[4],
                    indexI7_6: indexI7[5],
                    indexI7_7: indexI7[6],
                    indexI7_8: indexI7[7],
                    indexI5_1: indexI5[0],
                    indexI5_2: indexI5[1],
                    indexI5_3: indexI5[2],
                    indexI5_4: indexI5[3],
                    indexI5_5: indexI5[4],
                    indexI5_6: indexI5[5],
                    indexI5_7: indexI5[6],
                    indexI5_8: indexI5[7]
                });
            } else {
                node.set('checked', false);
            }
        } else {
            var record = store.findRecord('libraryId', node.get('libraryId'));
            store.remove(record);
        }

        // Update Summary
        grid.getView().refresh();

        // Highlight cells which have low color diversity
        $.each(grid.problematicCycles, function(idx, id) {
            $('.x-grid-row-summary .x-grid-cell-' + id).addClass('problematic-cycle');
        });
        grid.problematicCycles = [];

        // Update grid's header and enable/disable 'Pool' button
        if (store.getCount() > 1) {
            var totalPoolSize = grid.getStore().sum('sequencingDepth');
            grid.setTitle('Pool (total size: ' + totalPoolSize + ' M)');
            Ext.getCmp('savePool').setDisabled(false);
        } else {
            grid.setTitle('Pool');
            Ext.getCmp('savePool').setDisabled(true);
        }
    },

    isUnique: function(store, node) {
        if (store.getCount()) {
            var record = store.findRecord('indexI7', node.get('indexI7'));
            if (record) {
                Ext.ux.ToastMessage('Selected index is already in the pool.', 'warning');
                return false;
            }
        }
        return true;
    },

    isCompatible: function(store, node) {
        if (store.getCount()) {
            // Same Read Length
            var record = store.getAt(0);
            if (record.get('sequencingRunCondition') != node.get('sequencingRunCondition')) {
                Ext.ux.ToastMessage('Read lengths must be the same.', 'warning');
                return false;
            }
        }
        return true;
    },

    isColorDiversityMaximized: function(store, node) {
        return true;
    },

    isPoolSizeOk: function(store, node) {
        var maxPoolSize = Ext.getCmp('poolSize').getValue(),
            poolSize = 0;

        store.each(function(record) {
            poolSize += record.get('sequencingDepth');
        });
        poolSize += node.get('sequencingDepth');

        if (poolSize > maxPoolSize) {
            Ext.ux.ToastMessage('You have exceeded Pool Size.<br>Please increase it.', 'warning');
            // return false;
        }

        return true;
    },

    onSequenceDepthEdit: function(editor, context) {
        var grid = this.getView().down('grid'),
            record = context.record,
            changes = record.getChanges(),
            value = context.newValues.sequencingDepth;

        record.set('sequencingDepth', value);

        // TODO: update grid's title and summary
    },

    savePool: function(btn) {
        var store = Ext.getCmp('poolGrid').getStore(),
            url = 'save_pool/';

        Ext.getCmp('poolingContainer').setLoading('Saving...');
        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                libraries: Ext.JSON.encode(Ext.Array.pluck(Ext.Array.pluck(store.data.items, 'data'), 'libraryId'))
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    Ext.getStore('PoolingTree').reload();
                    Ext.getCmp('poolGrid').setTitle('Pool');
                    Ext.getCmp('poolGrid').getStore().removeAll();
                    Ext.getCmp('poolingContainer').setLoading(false);
                    Ext.ux.ToastMessage('Pool has been saved!');
                } else {
                    Ext.getCmp('poolingContainer').setLoading(false);
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url + ': ' + obj.error);
                    console.error(response);
                }
            },

            failure: function (response) {
                Ext.getCmp('poolingContainer').setLoading(false);
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
                console.error(response);
            }
        });
    }
});
