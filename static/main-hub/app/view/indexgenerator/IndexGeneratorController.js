Ext.define('MainHub.view.indexgenerator.IndexGeneratorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.index-generator',
    requires: [],

    config: {
        control: {
            '#': {
                activate: 'activateView',
                boxready: 'boxready'
            },
            '#indexGeneratorTable': {
                beforeedit: 'toggleEditors',
                edit: 'editRecord',
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu'
            },
            '#checkColumn': {
                beforecheckchange: 'beforeSelect',
                checkchange: 'checkRecord'
            },
            '#savePool': {
                click: 'save'
            },
            '#generateIndices': {
                click: 'generateIndices'
            }
        }
    },

    activateView: function() {
        Ext.getStore('indexGeneratorStore').reload();
        Ext.getCmp('poolSizeCb').clearValue();  // reset PoolSize
    },

    boxready: function() {
        Ext.getStore('indexGeneratorStore').on('load', function() {
            Ext.getCmp('poolGrid').getStore().removeAll();
        });
    },

    toggleEditors: function(editor, context) {
        var record = context.record,
            indexTypeEditor = Ext.getCmp('indexTypePoolingEditor');

        // Don't show the editors when a selection checkbox was clicked
        if (context.colIdx === 0) return false;

        if (record.get('recordType') === 'L') {
            indexTypeEditor.disable();
        } else {
            indexTypeEditor.enable();
        }
    },

    editRecord: function(editor, context) {
        var record = context.record,
            values = context.newValues,
            checkColumn = editor.cmp.down('#checkColumn');

        var params = $.extend({
            library_id: record.get('libraryId'),
            sample_id: record.get('sampleId'),
            qc_result: values.qc_result !== null ? values.qc_result : ''
        }, values);

        Ext.Ajax.request({
            url: 'index_generator/update/',
            method: 'POST',
            scope: this,
            params: params,
            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    Ext.getStore('indexGeneratorStore').reload();
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
        var store = Ext.getStore('indexGeneratorStore');
        var allowedColumns = ['read_length', 'index_type'];

        if (typeof dataIndex !== undefined && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('requestId') === record.get('requestId') && item !== record) {
                    if (dataIndex === 'read_length' || (dataIndex === 'index_type' && item.get('recordType') === 'S')) {
                        item.set(dataIndex, record.get(dataIndex));
                    }
                }
            });
            store.sync({
                failure: function(batch, options) {
                    var error = batch.operations[0].getError();
                    console.error(error);
                    setTimeout(function() {
                        Ext.ux.ToastMessage(error.statusText, 'error');
                    }, 100);
                }
            });
            Ext.getStore('indexGeneratorStore').reload();
        }
    },

    resetGeneratedIndices: function() {
        var store = Ext.getCmp('poolGrid').getStore();
        store.each(function(record) {
            if (record.get('recordType') === 'S') {
                record.set({
                    indexI7: '',
                    indexI7Id: '',
                    indexI5: '',
                    indexI5Id: ''
                });

                for (var i = 0; i < 8; i++) {
                    record.set('indexI7_' + (i + 1), '');
                    record.set('indexI5_' + (i + 1), '');
                }
            }
        });
    },

    showContextMenu: function(gridView, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
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

    beforeSelect: function() {
        if (!Ext.getCmp('poolSizeCb').getValue()) {
            Ext.ux.ToastMessage('Pool Size must be set.', 'warning');
            return false;
        }
        return true;
    },

    selectAll: function(requestId) {
        var me = this,
            store = Ext.getStore('indexGeneratorStore'),
            poolGridStore = Ext.getCmp('poolGrid').getStore(),
            checkColumn = Ext.getCmp('indexGeneratorTable').down('#checkColumn');

        if (!Ext.getCmp('poolSizeCb').getValue()) {
            Ext.ux.ToastMessage('Pool Size must be set.', 'warning');
            return false;
        }

        store.each(function(item) {
            var itemInPool = null;
            if (item.get('recordType') === 'L') {
                itemInPool = poolGridStore.findRecord('libraryId', item.get('libraryId'));
            } else {
                itemInPool = poolGridStore.findRecord('sampleId', item.get('sampleId'));
            }

            if (item.get('requestId') === parseInt(requestId) && !itemInPool) {
                if (me.isIndexTypeSet(poolGridStore, item, false) && me.isUnique(poolGridStore, item, false) &&
                    me.isCompatible(poolGridStore, item, false) && me.isPoolSizeOk(poolGridStore, item, false)) {

                    item.set('selected', true);
                    checkColumn.fireEvent('checkchange', checkColumn, null, true, item);
                }
            }
        });
    },

    checkRecord: function(checkColumn, rowIndex, checked, record, e) {
        var grid = Ext.getCmp('poolGrid'),
            store = grid.getStore();

        // Reset all samples' indices
        this.resetGeneratedIndices();

        if (checked) {
            if (this.isIndexTypeSet(store, record) && this.isUnique(store, record) &&
                this.isCompatible(store, record) && this.isPoolSizeOk(store, record)) {

                var indexI7Sequence = record.get('indexI7'),
                    indexI7 = indexI7Sequence.split('');
                if (indexI7Sequence.length === 6) {
                    $.merge(indexI7, [' ', ' ']);
                }

                var indexI5Sequence = record.get('indexI5'),
                    indexI5 = indexI5Sequence.split('');
                if (indexI5Sequence.length === 0) {
                    indexI5 = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
                } else if (indexI5Sequence.length === 6) {
                    $.merge(indexI5, [' ', ' ']);
                }

                store.add({
                    name: record.get('name'),
                    libraryId: record.get('libraryId'),
                    sampleId: record.get('sampleId'),
                    recordType: record.get('recordType'),
                    sequencingDepth: record.get('sequencingDepth'),
                    read_length: record.get('read_length'),
                    index_type: record.get('index_type'),
                    indexI7: indexI7Sequence,
                    indexI5: indexI5Sequence,
                    indexI7Id: record.get('indexI7Id'),
                    indexI5Id: record.get('indexI5Id'),
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
                // Ext.ux.ToastMessage('Please make sure everything is set.', 'warning');
                record.set('selected', false);
            }
        } else {
            var item = null;
            if (record.get('recordType') === 'L') {
                item = store.findRecord('libraryId', record.get('libraryId'));
            } else {
                item = store.findRecord('sampleId', record.get('sampleId'));
            }
            if (item)  store.remove(item);
        }

        // Update Summary
        grid.getView().refresh();

        // Highlight cells which have low color diversity
        grid.problematicCycles = [];
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

    isIndexTypeSet: function(store, record, showNotification) {
        var notif = showNotification === undefined;
        // Check if Index Type is set (only for samples)
        if (record.get('recordType') === 'S' && record.get('index_type') === 0) {
            if (notif) Ext.ux.ToastMessage('Index Type must be set.', 'warning');
            return false;
        }
        return true;
    },

    isUnique: function(store, record, showNotification) {
        var notif = showNotification === undefined;
        if (store.getCount()) {
            var recordI7 = store.findRecord('indexI7', record.get('indexI7')),
                recordI5 = store.findRecord('indexI5', record.get('indexI5'));

            if (recordI7 || recordI5) {
                if (notif) Ext.ux.ToastMessage('Selected index (I7/I5) is already in the pool.', 'warning');
                return false;
            }
        }
        return true;
    },

    isCompatible: function(store, record, showNotification) {
        var notif = showNotification === undefined;
        if (store.getCount()) {
            var firstItem = store.getAt(0);
            var indexTypesStore = Ext.getStore('indexTypesStore');
            var firstItemIndexType = indexTypesStore.findRecord('id', firstItem.get('index_type'));
            var recordIndexType = indexTypesStore.findRecord('id', record.get('index_type'));

            // Same Read Length
            if (firstItem.get('read_length') !== record.get('read_length')) {
                if (notif) Ext.ux.ToastMessage('Read lengths must be the same.', 'warning');
                return false;
            }

            // No pooling of dual and single indices
            if (firstItemIndexType && recordIndexType && firstItemIndexType.get('isDual') !== recordIndexType.get('isDual')) {
                if (notif) Ext.ux.ToastMessage('Pooling of dual and single indices is not allowed.', 'warning');
                return false;
            }

            // No pooling of indices with the length of 6 and 8 nucleotides (no mixed length)
            if (firstItemIndexType && recordIndexType && firstItemIndexType.get('indexLength') !== recordIndexType.get('indexLength')) {
                if (notif) Ext.ux.ToastMessage('Pooling of indices with 6 and 8 nucleotides (mixed) is not allowed.', 'warning');
                return false;
            }
        }
        return true;
    },

    isPoolSizeOk: function(store, record, showNotification) {
        var notif = showNotification === undefined;
        var poolSizeId = Ext.getCmp('poolSizeCb').getValue();
        var poolSizeItem = Ext.getStore('poolSizesStore').findRecord('id', poolSizeId);
        var poolSize = 0;

        store.each(function(record) {
            poolSize += record.get('sequencingDepth');
        });
        poolSize += record.get('sequencingDepth');

        if (poolSize > poolSizeItem.get('multiplier') * poolSizeItem.get('size')) {
            if (notif) Ext.ux.ToastMessage('You have exceeded the Pool Size.<br>Please increase it.', 'warning');
            // return false;
        }

        return true;
    },

    isPoolValid: function(store) {
        var result = true;
        store.each(function(record) {
            if (record.get('indexI7_1') === '') {  // at least, indices I7 must be set
                result = false;
            }
        });
        return result;
    },

    generateIndices: function() {
        var indexGeneratorTable = Ext.getCmp('indexGeneratorTable'),
            grid = Ext.getCmp('poolGrid'),
            store = grid.getStore(),
            url = 'index_generator/generate_indices/';

        // Reset all samples' indices
        this.resetGeneratedIndices();

        indexGeneratorTable.disable();
        grid.setLoading('Generating...');
        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 60000,
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
                    console.error('[ERROR]: ' + url);
                }

                indexGeneratorTable.enable();
                grid.setLoading(false);
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url);
                console.error(response);

                indexGeneratorTable.enable();
                grid.setLoading(false);
            }
        });
    },

    save: function() {
        var store = Ext.getCmp('poolGrid').getStore(),
            poolSizeId = Ext.getCmp('poolSizeCb').getValue(),
            url = 'index_generator/save_pool/';

        if (this.isPoolValid(store)) {
            // Get all libraries' and samples' ids
            var libraries = [],
                samples = [];

            store.each(function(record) {
                if (record.get('recordType') === 'L') {
                    libraries.push(record.get('libraryId'));
                } else {
                    samples.push({
                        sample_id: record.get('sampleId'),
                        index_i7_id: record.get('indexI7Id') ? record.get('indexI7Id') : '',
                        index_i5_id: record.get('indexI5Id') ? record.get('indexI5Id') : ''
                    });
                }
            });

            Ext.getCmp('poolingContainer').setLoading('Saving...');
            Ext.Ajax.request({
                url: url,
                method: 'POST',
                timeout: 1000000,
                scope: this,

                params: {
                    pool_size_id: poolSizeId,
                    libraries: Ext.JSON.encode(libraries),
                    samples: Ext.JSON.encode(samples)
                },

                success: function(response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        Ext.getCmp('poolGrid').setTitle('Pool');
                        Ext.getCmp('poolingContainer').setLoading(false);
                        Ext.ux.ToastMessage('Pool has been saved!');

                        // Reload stores
                        Ext.getStore('indexGeneratorStore').reload();
                        // if (Ext.getStore('libraryPreparationStore')) Ext.getStore('libraryPreparationStore').reload();
                        // if (Ext.getStore('poolingStore').isLoaded()) Ext.getStore('poolingStore').reload();
                        // MainHub.Utilities.reloadAllStores();
                    } else {
                        Ext.getCmp('poolingContainer').setLoading(false);
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.error('[ERROR]: ' + url);
                    }
                },

                failure: function(response) {
                    Ext.getCmp('poolingContainer').setLoading(false);
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.error('[ERROR]: ' + url);
                    console.error(response);
                }
            });
        } else {
            Ext.ux.ToastMessage('Some of the indices are empty. The pool cannot be saved.', 'warning');
        }
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
