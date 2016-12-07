Ext.define('MainHub.view.flowcell.PoolInfoWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.flowcell-poolinfowindow',

    config: {
        control: {
            '#': {
                boxready: 'loadInfo'
            }
        }
    },

    loadInfo: function(wnd) {
        Ext.getStore('poolInfoStore').load({
            params: {
                'pool_id': wnd.poolId
            },
            callback: function(records, operation, success) {
                if (!success) Ext.ux.ToastMessage('Cannot load information for the given pool.', 'error');
            }
        });
    }
});
