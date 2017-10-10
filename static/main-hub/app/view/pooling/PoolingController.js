Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    mixins: [
        'MainHub.grid.SearchInputMixin',
        'MainHub.grid.ContextMenuMixin',
        'MainHub.store.SyncStoreMixin'
    ],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#pooling-grid': {
                // boxready: 'refresh',
                // refresh: 'refresh',
                itemcontextmenu: 'showContextMenu',
                groupcontextmenu: 'showGroupContextMenu',
                beforeEdit: 'toggleEditors',
                edit: 'editRecord'
            },
            '#check-column': {
                beforecheckchange: 'selectRecord'
            },
            '#download-benchtop-protocol-button': {
                click: 'downloadBenchtopProtocol'
            },
            '#download-pooling-template-button': {
                click: 'downloadPoolingTemplate'
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
        Ext.getStore('poolingStore').reload();
    },

    // refresh: function() {
    //     Ext.getStore('poolingStore').load(function(records, operation, success) {
    //         if (success && records.length > 0) {
    //             Ext.getCmp('downloadBenchtopProtocolPBtn').setDisabled(false);
    //             Ext.getCmp('downloadPoolingTemplateBtn').setDisabled(false);
    //         }
    //     });
    // },

    selectRecord: function(cb, rowIndex, checked, record) {
        // Don't select samples which aren't prepared yet
        if (!this.isPrepared(record)) {
            return false;
        } else {
            // Don't select records from a different pool
            var selectedRecord = Ext.getStore('poolingStore').findRecord('selected', true);
            if (selectedRecord) {
                if (record.get('pool') !== selectedRecord.get('pool')) {
                    new Noty({
                        text: 'You can only select libraries from the same pool.',
                        type: 'warning'
                    }).show();
                    return false;
                }
            }
        }
    },

    selectUnselectAll: function(poolId, selected) {
        var me = this;
        var store = Ext.getStore('poolingStore');
        var selectedItems = this.getSelectedItems();

        if (selectedItems.length > 0 && selectedItems[0].pool !== poolId) {
            new Noty({
                text: 'You can only select libraries from the same pool.',
                type: 'warning'
            }).show();
            return false;
        }

        store.each(function(item) {
            if (item.get('pool') === poolId && me.isPrepared(item)) {
                item.set('selected', selected);
            }
        });
    },

    toggleEditors: function(editor, context) {
        var record = context.record;
        if (record.get('record_type') === 'Sample' && (
            record.get('status') === 2 || record.get('status') === -2)) {
            return false
        }
    },

    editRecord: function(editor, context) {
        var record = context.record;
        var changes = record.getChanges();
        var values = context.newValues;
        var reload = Object.keys(changes).indexOf('quality_check') !== -1;

        // Set Concentration C1
        if (Object.keys(changes).indexOf('concentration_c1') === -1 &&
            values.concentration > 0 && values.mean_fragment_size > 0) {
            var concentrationC1 = ((values.concentration /
                (values.mean_fragment_size * 650)) * Math.pow(10, 6)).toFixed(1);

            record.set('concentration_c1', concentrationC1);
        }

        // Send the changes to the server
        this.syncStore('poolingStore', reload);
    },

    applyToAll: function(record, dataIndex) {
        var me = this;
        var store = Ext.getStore('poolingStore');
        var allowedColumns = ['concentration_c1'];

        if (dataIndex && allowedColumns.indexOf(dataIndex) !== -1) {
            store.each(function(item) {
                if (item.get('pool') === record.get('pool') &&
                    item !== record && me.isPrepared(item)) {
                    item.set(dataIndex, record.get(dataIndex));
                }
            });

            // Send the changes to the server
            this.syncStore('poolingStore');
        }
    },

    qualityCheckAll: function(poolId, result) {
        var store = Ext.getStore('poolingStore');

        store.each(function(item) {
            if (item.get('pool') === poolId && item.get('selected')) {
                item.set('quality_check', result);
            }
        });

        if (store.getModifiedRecords().length === 0) {
            new Noty({
                text: 'You did not select any libraries.',
                type: 'warning'
            }).show();
            return;
        }

        // Send the changes to the server
        this.syncStore('poolingStore', true);
    },

    downloadBenchtopProtocol: function() {
        var store = Ext.getStore('poolingStore');
        var libraries = [];
        var samples = [];

        store.each(function(record) {
            if (record.get('selected')) {
                if (record.get('record_type') === 'Library') {
                    samples.push(record.get('pk'));
                } else {
                    libraries.push(record.get('pk'));
                }
            }
        });

        if (libraries.length === 0 && samples.length === 0) {
            new Noty({ text: 'You did not select any libraries.', type: 'warning' }).show();
            return;
        }

        var poolId = store.data.items[0].get('pool');
        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true
        });

        form.submit({
            url: 'api/pooling/download_benchtop_protocol/',
            target: '_blank',
            params: {
                pool_id: poolId,
                samples: Ext.JSON.encode(samples),
                libraries: Ext.JSON.encode(libraries)
            }
        });
    },

    downloadPoolingTemplate: function() {
        var store = Ext.getStore('poolingStore');
        var libraries = [];
        var samples = [];

        store.each(function(record) {
            if (record.get('selected')) {
                if (record.get('record_type') === 'Library') {
                    samples.push(record.get('pk'));
                } else {
                    libraries.push(record.get('pk'));
                }
            }
        });

        if (libraries.length === 0 && samples.length === 0) {
            new Noty({ text: 'You did not select any libraries.', type: 'warning' }).show();
            return;
        }

        var form = Ext.create('Ext.form.Panel', {
            standardSubmit: true
        });

        form.submit({
            url: 'api/pooling/download_pooling_template/',
            target: '_blank',
            params: {
                samples: Ext.JSON.encode(samples),
                libraries: Ext.JSON.encode(libraries)
            }
        });
    },

    save: function() {
        // Send the changes to the server
        this.syncStore('poolingStore');
    },

    cancel: function() {
        Ext.getStore('poolingStore').rejectChanges();
    },

    isPrepared: function(item) {
        return item.get('record_type') === 'Library' ||
            (item.get('record_type') === 'Sample' && item.get('status') === 3);
    },

    getSelectedItems: function() {
        var store = Ext.getStore('poolingStore');
        var selectedItems = [];

        store.each(function(item) {
            if (item.get('selected')) {
                selectedItems.push({
                    pk: item.get('pk'),
                    record_type: item.get('record_type'),
                    pool: item.get('pool')
                });
            }
        });

        return selectedItems;
    }
});
