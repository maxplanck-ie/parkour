Ext.define('MainHub.view.pooling.PoolingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pooling',

    requires: ['Ext.ux.FileUploadWindow'],

    config: {
        control: {
            '#poolingTable': {
                boxready: 'onPoolingTableBoxready',
                refresh: 'onPoolingTableRefresh',
                groupcontextmenu: 'onGroupContextMenu'
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
                text: 'Upload File',
                iconCls: 'x-fa fa-upload',
                // handler: function() {
                //     me.uploadFile(group);
                // }
            }]
        }).showAt(e.getXY());
    }
});
