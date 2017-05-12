Ext.define('MainHub.view.flowcell.LoadFlowcellsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcells',

    requires: ['MainHub.view.flowcell.LoadFlowcellWindow'],

    config: {
        control: {
            '#': {
                activate: 'activateView'
            },
            '#loadBtn': {
                click: 'onLoadBtnClick'
            }
        }
    },

    activateView: function() {
        Ext.getStore('flowcellsStore').reload();
    },

    onLoadBtnClick: function() {
        Ext.create('MainHub.view.flowcell.LoadFlowcellWindow').show();
    }
});
