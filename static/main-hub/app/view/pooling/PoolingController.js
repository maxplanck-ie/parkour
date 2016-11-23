Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#poolingTable': {
                boxready: 'onPoolingTableBoxready',
                refresh: 'onPoolingTableRefresh',
                groupcontextmenu: 'onGroupContextMenu',
                edit: 'onPoolingTableEdit'
            }
        }
    },

    onPoolingTableBoxready: function() {
        Ext.getStore('poolingStore').load(function(records, operation, success) {
            if (success && records.length > 0) {
                Ext.getCmp('downloadBenchtopProtocolPBtn').setDisabled(false);
            }
        });
    },

    onPoolingTableRefresh: function(grid) {
        // Reload the store
        Ext.getStore('poolingStore').reload();
    },

    onGroupContextMenu: function(view, node, group, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Upload Template QC Normalization and Pooling',
                iconCls: 'x-fa fa-upload',
                // handler: function() {
                //     me.uploadFile(group);
                // }
            }]
        }).showAt(e.getXY());
    },

    onPoolingTableEdit: function(editor, context) {
        var grid = context.grid,
            record = context.record,
            changes = record.getChanges(),
            values = context.newValues,
            concentration = values.concentration,
            meanFragmentSize = values.meanFragmentSize,
            concentrationC1 = values.concentrationC1,
            concentrationC2 = values.concentrationC2,
            bufferVolume = values.bufferVolume,
            sampleVolume = values.sampleVolume,
            url = 'edit_pooling/';

        // Set Library Concentration C1
        if (concentration > 0 && meanFragmentSize > 0 &&
            Object.keys(changes).indexOf('concentrationC1') == -1) {
                concentrationC1 = ((concentration / (meanFragmentSize * 650)) * 1000000).toFixed(1);
        }

        // Set Buffer Volume V2
        if (concentrationC1 > 0 && sampleVolume > 0 && concentrationC2 > 0 &&
            (parseFloat(concentrationC1) * parseFloat(sampleVolume)) / parseFloat(concentrationC2) > parseFloat(sampleVolume) &&
            Object.keys(changes).indexOf('bufferVolume') == -1) {
                bufferVolume = ((concentrationC1 * sampleVolume) / concentrationC2 - sampleVolume).toFixed(1);
        }
    }
});
