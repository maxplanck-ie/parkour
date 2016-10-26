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
            '#poolGrid': {}
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

                store.add({
                    name: node.get('text'),
                    libraryId: node.get('libraryId'),
                    sequencingDepth: node.get('sequencingDepth'),
                    sequencingRunCondition: node.get('sequencingRunCondition'),
                    indexI7: indexI7Sequence,
                    indexI7Id: '',
                    indexI7_1: indexI7[0],
                    indexI7_2: indexI7[1],
                    indexI7_3: indexI7[2],
                    indexI7_4: indexI7[3],
                    indexI7_5: indexI7[4],
                    indexI7_6: indexI7[5],
                    indexI7_7: indexI7[6],
                    indexI7_8: indexI7[7]
                });

                var content = Ext.dom.Query.selectNode('.myText'),
                    rowsContainer = grid.getEl().select('.x-grid-item-container').elements[0];

                rowsContainer.append(content);
            } else {
                node.set('checked', false);
            }
        } else {
            var record = store.findRecord('libraryId', node.get('libraryId'));
            store.remove(record);
        }
    },

    isUnique: function(store, node) {
        if (store.getCount()) {
            var record = store.findRecord('indexI7', node.get('indexI7'));
            if (record) {
                Ext.ux.ToastMessage('The selected index is already in the pool.', 'warning');
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

        if (poolSize >= maxPoolSize) {
            Ext.ux.ToastMessage('You have exceeded Pool Size.<br>Please increase it.', 'warning');
            // return false;
        }

        return true;
    }
});
