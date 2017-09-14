Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#poolingTable': {
                // boxready: 'refresh',
                refresh: 'refresh',
                beforeEdit: 'toggleEditors',
                edit: 'editRecord',
                groupcontextmenu: 'showGroupContextMenu'
            },
            '#checkColumn': {
                beforecheckchange: 'selectRecord'
            },
            '#downloadBenchtopProtocolPBtn': {
                click: 'downloadBenchtopProtocol'
            },
            '#downloadPoolingTemplateBtn': {
                click: 'downloadPoolingTemplate'
            },
            '#searchField': {
                change: 'search'
            },
            '#cancelBtn': {
                click: 'cancel'
            },
            '#saveBtn': {
                click: 'save'
            }
        }
    },

    activateView: function() {
        Ext.getStore('poolingStore').reload();
    },

    refresh: function() {
        Ext.getStore('poolingStore').load(function(records, operation, success) {
            if (success && records.length > 0) {
                Ext.getCmp('downloadBenchtopProtocolPBtn').setDisabled(false);
                Ext.getCmp('downloadPoolingTemplateBtn').setDisabled(false);
            }
        });
    },

    toggleEditors: function(editor, context) {
        var record = context.record;
        if (record.get('sampleId') !== 0 && (
            record.get('status') === 2 || record.get('status') === -2)) {
            return false
        }
    },

    editRecord: function(editor, context) {
        var grid = context.grid;
        var record = context.record;
        var changes = record.getChanges();
        var values = context.newValues;
        var concentrationC1 = values.concentration_c1;
        var url = 'pooling/update/';

        var params = $.extend({
            library_id: record.get('libraryId'),
            sample_id: record.get('sampleId'),
            qc_result: values.qc_result !== null ? values.qc_result : ''
        }, values);

        // Set Library Concentration C1
        if (values.concentration > 0 && values.mean_fragment_size > 0 &&
            Object.keys(changes).indexOf('concentration_c1') === -1) {
            concentrationC1 = ((values.concentration / (values.mean_fragment_size * 650)) * Math.pow(10, 6)).toFixed(1);
            params.concentration_c1 = concentrationC1;
        }

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            scope: this,
            params: params,

            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj.success) {
                    grid.fireEvent('refresh', grid);
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

    selectRecord: function(cb, rowIndex, checked, record) {
        // Don't select samples which aren't prepared yet
        if (record.get('sampleId') !== 0 && (
            record.get('status') === 2 || record.get('status') === -2)) {
            return false;
        } else {
            // Don't select records from a different pool
            var selectedRecord = Ext.getStore('poolingStore').findRecord('selected', true);
            if (selectedRecord) {
                if (record.get('poolId') !== selectedRecord.get('poolId')) {
                    Ext.ux.ToastMessage('You can only select records from the same pool.', 'warning');
                    return false;
                }
            }
        }
    },

    selectAll: function(poolName) {
        var store = Ext.getStore('poolingStore');
        store.each(function(item) {
            var isNotPrepared = item.get('sampleId') !== 0 && (
                item.get('status') === 2 || item.get('status') === -2);

            var selectedRecordIndex = store.findBy(function(record) {
                if (record.get('selected') && record.get('poolName') !== poolName) {
                    return true;
                }
            });

            if (selectedRecordIndex !== -1) return;

            if (item.get('poolName') === poolName && !isNotPrepared) {
                item.set('selected', true);
            }
        });
    },

    downloadBenchtopProtocol: function() {
        var store = Ext.getStore('poolingStore');
        var poolName = '';
        var libraries = [];
        var samples = [];

        // Get all checked (selected) records
        store.each(function(record) {
            if (record.get('selected')) {
                if (record.get('libraryId') === 0) {
                    samples.push(record.get('sampleId'));
                    poolName = record.get('poolName');
                } else {
                    libraries.push(record.get('libraryId'));
                    poolName = record.get('poolName');
                }
            }
        });

        if (libraries.length > 0 || samples.length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'pooling/download_benchtop_protocol/',
                target: '_blank',
                params: {
                    pool_name: poolName,
                    samples: Ext.JSON.encode(samples),
                    libraries: Ext.JSON.encode(libraries)
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any libraries.', 'warning');
        }
    },

    downloadPoolingTemplate: function() {
        var store = Ext.getStore('poolingStore');
        var libraries = [];
        var samples = [];

        // Get all checked (selected) records
        store.each(function(record) {
            if (record.get('selected')) {
                if (record.get('libraryId') === 0) {
                    samples.push(record.get('sampleId'));
                } else {
                    libraries.push(record.get('libraryId'));
                }
            }
        });

        if (libraries.length > 0 || samples.length > 0) {
            var form = Ext.create('Ext.form.Panel', {
                standardSubmit: true
            });

            form.submit({
                url: 'pooling/download_pooling_template/',
                target: '_blank',
                params: {
                    samples: Ext.JSON.encode(samples),
                    libraries: Ext.JSON.encode(libraries)
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any libraries.', 'warning');
        }
    },

    cancel: function() {
        Ext.getStore('poolingStore').rejectChanges();
    },

    save: function() {
        MainHub.Store.save('poolingStore');
    },

    search: function(fld, query) {
        var grid = Ext.getCmp('poolingTable');
        var store = grid.getStore();
        var columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column] && record.data[column].toString().toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });
    }
});
