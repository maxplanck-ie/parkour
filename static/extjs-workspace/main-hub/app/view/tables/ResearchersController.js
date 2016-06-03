Ext.define('MainHub.view.tables.ResearchersController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.researchers',

    config: {
        control: {
            '#researchersTable': {
                boxready: 'onResearchersTableBoxready',
                beforerender : 'onResearchersTableBeforerender'
            }
        }
    },

    onResearchersTableBoxready: function(grid) {
        grid.setLoading(true);
    },

    onResearchersTableBeforerender: function(grid) {
        Ext.Ajax.request({
            url: 'get_researchers/',

            success: function (response) {
                var data = Ext.JSON.decode(response.responseText);
                var store = Ext.create('MainHub.store.Researchers', {
                    data: data
                });

                grid.setStore(store);
                grid.down('pagingtoolbar').bindStore(store);
                store.loadPage(1);
                grid.setLoading(false);
            },

            failure: function(response) {
                grid.setLoading(false);
                console.log('[ERROR]: get_researchers()');
                console.log(response);
            }
        });
    }
});
