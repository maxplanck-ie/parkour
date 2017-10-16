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
        var record = context.record;
        var values = context.newValues;
        // var checkColumn = editor.cmp.down('#checkColumn');

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
                    new Noty({ text: obj.error, type: 'error' }).show();
                }
            },
            failure: function(response) {
                new Noty({ text: response.statusText, type: 'error' }).show();
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
                    new Noty({ text: error.statusText, type: 'error' }).show();
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
                    var dataIndex = MainHub.Utilities.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            }, {
                text: 'Reset',
                iconCls: 'x-fa fa-eraser',
                handler: function() {
                    Ext.Msg.show({
                        title: 'Reset',
                        message: 'Are you sure you want to reset the record\'s values?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        fn: function(btn) {
                            if (btn === 'yes') {
                                me.reset(record);
                            }
                        }
                    });
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
            new Noty({ text: 'Pool Size must be set.', type: 'warning' }).show();
            return false;
        }
        return true;
    },

    selectAll: function(requestId) {
        var me = this;
        var store = Ext.getStore('indexGeneratorStore');
        var poolGridStore = Ext.getCmp('poolGrid').getStore();
        var checkColumn = Ext.getCmp('indexGeneratorTable').down('#checkColumn');

        if (!Ext.getCmp('poolSizeCb').getValue()) {
            new Noty({ text: 'Pool Size must be set.', type: 'warning' }).show();
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
        var grid = Ext.getCmp('poolGrid');
        var store = grid.getStore();

        // Reset all samples' indices
        this.resetGeneratedIndices();

        if (checked) {
            // if (this.isIndexTypeSet(store, record) && this.isUnique(store, record) &&
            //     this.isCompatible(store, record) && this.isPoolSizeOk(store, record)) {
            if (this.isIndexTypeSet(store, record) && this.isCompatible(store, record) &&
                this.isPoolSizeOk(store, record)) {

                var indexI7Sequence = record.get('indexI7');
                var indexI5Sequence = record.get('indexI5');
                var indexI7 = indexI7Sequence.split('');
                var indexI5 = indexI5Sequence.split('');

                if (indexI7Sequence.length === 6) {
                    $.merge(indexI7, [' ', ' ']);
                }

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
            if (item) {
                store.remove(item);
            }
        }

        // Update Summary
        grid.getView().refresh();

        // Highlight cells which have low color diversity
        grid.problematicCycles = [];
        $.each(grid.problematicCycles, function(idx, id) {
            $('.x-grid-row-summary .x-grid-cell-' + id).addClass('problematic-cycle');
        });
        // grid.problematicCycles = [];

        // Update grid's header and enable/disable 'Pool' button
        if (store.getCount() > 0) {
            var totalPoolSize = grid.getStore().sum('sequencingDepth');
            grid.setTitle('Pool (total size: ' + totalPoolSize + ' M)');
            Ext.getCmp('savePool').enable();

            var recordTypes = Ext.pluck(Ext.Array.pluck(store.data.items, 'data'), 'recordType');
            if (recordTypes.indexOf('S') > -1) {
                Ext.getCmp('generateIndices').enable();
            }
        } else {
            grid.setTitle('Pool');
            Ext.getCmp('savePool').disable();
            Ext.getCmp('generateIndices').disable();
        }
    },

    isIndexTypeSet: function(store, record, showNotification) {
        var notif = showNotification === undefined;
        // Check if Index Type is set (only for samples)
        if (record.get('recordType') === 'S' && record.get('index_type') === 0) {
            if (notif) {
                new Noty({ text: 'Index Type must be set.', type: 'warning' }).show();
            }
            return false;
        }
        return true;
    },

    isUnique: function(store, record, showNotification) {
        var notif = showNotification === undefined;
        if (store.getCount()) {
            var recordI7 = store.findRecord('indexI7', record.get('indexI7'));
            var recordI5 = store.findRecord('indexI5', record.get('indexI5'));

            if (recordI7 || recordI5) {
                if (notif) {
                    new Noty({
                        text: 'Selected index (I7/I5) is already in the pool.',
                        type: 'warning'
                    }).show();
                }
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
                if (notif) {
                    new Noty({
                        text: 'Read lengths must be the same.',
                        type: 'warning'
                    }).show();
                }
                return false;
            }

            // No pooling of dual and single indices
            if (firstItemIndexType && recordIndexType && firstItemIndexType.get('isDual') !== recordIndexType.get('isDual')) {
                if (notif) {
                    new Noty({
                        text: 'Pooling of dual and single indices is not allowed.',
                        type: 'warning'
                    }).show();
                }
                return false;
            }

            // No pooling of indices with the length of 6 and 8 nucleotides (no mixed length)
            if (firstItemIndexType && recordIndexType && firstItemIndexType.get('indexLength') !== recordIndexType.get('indexLength')) {
                if (notif) {
                    new Noty({
                        text: 'Pooling of indices with 6 and 8 nucleotides (mixed) is not allowed.',
                        type: 'warning'
                    }).show();
                }
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
            if (notif) {
                new Noty({
                    text: 'You have exceeded the Pool Size.<br>Please increase it.',
                    type: 'warning'
                }).show();
            }
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
        var indexGeneratorTable = Ext.getCmp('indexGeneratorTable');
        var grid = Ext.getCmp('poolGrid');
        var store = grid.getStore();

        // Reset all samples' indices
        this.resetGeneratedIndices();

        indexGeneratorTable.disable();
        grid.setLoading('Generating...');
        Ext.Ajax.request({
            url: 'index_generator/generate_indices/',
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
                    new Noty({ text: obj.error, type: 'error' }).show();
                }

                indexGeneratorTable.enable();
                grid.setLoading(false);
            },
            failure: function(response) {
                new Noty({ text: response.statusText, type: 'error' }).show();
                console.error(response);

                indexGeneratorTable.enable();
                grid.setLoading(false);
            }
        });
    },

    save: function() {
        var store = Ext.getCmp('poolGrid').getStore();
        var poolSizeId = Ext.getCmp('poolSizeCb').getValue();

        if (!this.isPoolValid(store)) {
            new Noty({
                text: 'Some of the indices are empty. The pool cannot be saved.',
                type: 'warning'
            }).show();
            return;
        }

        // Get all libraries' and samples' ids
        var libraries = [];
        var samples = [];

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
            url: 'index_generator/save_pool/',
            method: 'POST',
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
                    new Noty({ text: 'Pool has been saved!' }).show();

                    // Reload stores
                    Ext.getStore('indexGeneratorStore').reload();
                } else {
                    Ext.getCmp('poolingContainer').setLoading(false);
                    new Noty({ text: obj.error, type: 'error' }).show();
                }
            },
            failure: function(response) {
                Ext.getCmp('poolingContainer').setLoading(false);
                new Noty({ text: response.statusText, type: 'error' }).show();
                console.error(response);
            }
        });
    },

    reset: function(record) {
        Ext.Ajax.request({
            url: 'index_generator/reset/',
            method: 'POST',
            timeout: 60000,
            scope: this,
            params: {
                status: 1,
                dilution_factor: 1,
                record_type: record.get('recordType'),
                record_id: record.get('recordType') === 'L' ? record.get('libraryId') : record.get('sampleId')
            },
            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    Ext.getCmp('poolGrid').setTitle('Pool');
                    Ext.getStore('indexGeneratorStore').reload();
                    new Noty({ text: 'The changes have been saved!' }).show();
                } else {
                    new Noty({ text: obj.error, type: 'error' }).show();
                }
            },
            failure: function(response) {
                new Noty({ text: response.statusText, type: 'error' }).show();
                console.error(response);
            }
        });
    }
});
