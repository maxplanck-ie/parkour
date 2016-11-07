Ext.define('MainHub.view.pooling.IndexGeneratorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.index-generator',

    requires: [],

    config: {
        control: {
            '#': {
                boxready: 'onIndexGeneratorBoxready'
            },
            '#poolingTreePanel': {
                edit: 'onPoolingTreePanelEdit',
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
            },
            '#generateIndices': {
                click: 'generateIndicesBtnClick'
            }
        }
    },

    onIndexGeneratorBoxready: function() {
        // Clear Pool after reloading PoolingTree
        Ext.getStore('PoolingTree').on('load', function() {
            Ext.getCmp('poolGrid').getStore().removeAll();
        });
    },

    onMaxPoolSizeBoxready: function(cb) {
        cb.select(25, true);
    },

    onPoolingTreePanelEdit: function(editor, context) {
        var record = context.record,
            originalValue = context.originalValue,
            values = context.newValues;

        // Set Read Length (Sequencing Run Condition)
        if (values.sequencingRunConditionName !== null) {
            var readLengthRecord = Ext.getStore('sequencingRunConditionsStore')
                .findRecord('id', values.sequencingRunConditionName);
            record.set('sequencingRunCondition', readLengthRecord.get('id'));
            record.set('sequencingRunConditionName', readLengthRecord.get('name'));

            var recordId = null;
            if (record.get('recordType') == 'L') {
                recordId = record.get('libraryId');
            } else {
                recordId = record.get('sampleId');
            }

            // Update record in the database
            Ext.Ajax.request({
                url: 'update_sequencing_run_condition/',
                method: 'POST',
                scope: this,
                params: {
                    record_type: record.get('recordType'),
                    record_id: recordId,
                    sequencing_run_condition_id: readLengthRecord.get('id')
                }
            });
        }

        // Set Index Type (for samples)
        if (record.get('recordType') == 'S' && values.indexTypeName !== null) {
            var indexTypeRecord = Ext.getStore('indexTypesStore').findRecord('id', values.indexTypeName);
            record.set('indexType', indexTypeRecord.get('id'));
            record.set('indexTypeName', indexTypeRecord.get('name'));

            // Update record in the database
            Ext.Ajax.request({
                url: 'update_index_type/',
                method: 'POST',
                scope: this,
                params: {
                    sample_id: record.get('sampleId'),
                    index_type_id: indexTypeRecord.get('id')
                }
            });
        }
    },

    onPoolingTreePanelCheckchange: function(node, checked) {
        var grid = Ext.getCmp('poolGrid'),
            store = grid.getStore();

        // Reset all samples' indices
        store.each(function(record) {
            if (record.get('recordType') == 'S') {
                record.set('indexI7', '');
                record.set('indexI7Id', '');
                record.set('indexI5', '');
                record.set('indexI5Id', '');

                for (var i = 0; i < 8; i++) {
                    record.set('indexI7_' + (i + 1), '');
                    record.set('indexI5_' + (i + 1), '');
                }
            }
        });

        if (checked) {
            if (this.isUnique(store, node) && this.isCompatible(store, node) &&
                this.isIndexTypeSet(store, node) && this.isPoolSizeOk(store, node)) {

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
                    sampleId: node.get('sampleId'),
                    recordType: node.get('recordType'),
                    sequencingDepth: node.get('sequencingDepth'),
                    sequencingRunCondition: node.get('sequencingRunCondition'),
                    indexType: node.get('indexType'),
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
            var record = null;
            if (node.get('recordType') == 'L') {
                record = store.findRecord('libraryId', node.get('libraryId'));
            } else {
                record = store.findRecord('sampleId', node.get('sampleId'));
            }
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

            var recordTypes = Ext.pluck(Ext.Array.pluck(store.data.items, 'data'), 'recordType');
            if (recordTypes.indexOf('S') > -1) {
                Ext.getCmp('generateIndices').setDisabled(false);
            }
        } else {
            grid.setTitle('Pool');
            Ext.getCmp('savePool').setDisabled(true);
            Ext.getCmp('generateIndices').setDisabled(true);
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

    isIndexTypeSet: function(store, node) {
        // Check if Index Type is set (only for samples)
        if (node.get('recordType') == 'S') {
            if (node.get('indexType') === '') {
                Ext.ux.ToastMessage('Index Type must be set.', 'warning');
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
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
    },

    generateIndicesBtnClick: function(btn) {
        var poolingTreePanel = Ext.getCmp('poolingTreePanel'),
            grid = Ext.getCmp('poolGrid'),
            store = grid.getStore(),
            url = 'generate_indices/';

        poolingTreePanel.disable();
        grid.setLoading('Generating...');
        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                libraries: Ext.JSON.encode(Ext.Array.pluck(Ext.Array.pluck(store.data.items, 'data'), 'libraryId')),
                samples: Ext.JSON.encode(Ext.Array.pluck(Ext.Array.pluck(store.data.items, 'data'), 'sampleId'))
            },

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    store.removeAll();
                    store.add(obj.data);
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url + ': ' + obj.error);
                }
                poolingTreePanel.enable();
                grid.setLoading(false);
            },

            failure: function(response) {
                poolingTreePanel.enable();
                grid.setLoading(false);
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
                console.error(response);
            }
        });
    }
});
