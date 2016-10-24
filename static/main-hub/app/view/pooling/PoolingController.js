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
                boxready: 'onPoolSizeBoxready'
            }
        }
    },

    onPoolSizeBoxready: function(cb) {
        cb.select(25, true);
    },

    onPoolingTreePanelCheckchange: function(node, checked) {
        // TODO: Check if indices are unique and compatible
    }
});
