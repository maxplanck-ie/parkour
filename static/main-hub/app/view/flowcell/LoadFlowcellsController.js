Ext.define('MainHub.view.flowcell.LoadFlowcellsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcells',

    requires: ['MainHub.view.flowcell.LoadFlowcellWindow'],

    config: {
        control: {
            '#flowcellsTable': {
                boxready: 'onFlowcellsTableBoxready'
            },
            '#loadBtn': {
                click: 'onLoadBtnClick'
            }
        }
    },

    onFlowcellsTableBoxready: function(grid) {
        Ext.getStore('sequencersStore').load();
        Ext.getStore('readLengthsStore').reload(function(records, operation, success) {
            // Remove record 'Other'
            if (success) this.remove(this.findRecord('name', 'Other'));
        });
    },

    onLoadBtnClick: function() {
        Ext.create('MainHub.view.flowcell.LoadFlowcellWindow').show();
    }
});
