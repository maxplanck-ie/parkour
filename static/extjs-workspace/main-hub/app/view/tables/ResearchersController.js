Ext.define('MainHub.view.tables.ResearchersController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.researchers',

    config: {
        control: {
            '#researchersTable': {
                boxready: 'onResearchersTableBoxready',
                beforerender : 'onResearchersTableBeforerender',
                edit: 'onResearcherEdit'
            }
        }
    },

    onResearchersTableBoxready: function(grid) {
        grid.setLoading(true);
    },

    onResearchersTableBeforerender: function(grid) {
        Ext.Ajax.request({
            url: 'get_researchers/',
            timeout: 1000000,

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
    },

    onResearcherEdit: function(editor, e) {
        var grid = Ext.getCmp('researchersTable');

        grid.setLoading('Updating...');
        Ext.Ajax.request({
            url: 'edit_researcher/',
            method: 'POST',
            scope: this,

            params: {
                'researcher_id': e.record.data.researcherId,
                'first_name': e.record.data.firstName,
                'last_name': e.record.data.lastName,
                'telephone': e.record.data.telephone,
                'email': e.record.data.email,
                'pi': e.record.data.pi,
                'organization': e.record.data.organization,
                'cost_unit': e.record.data.costUnit
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    e.record.commit();
                } else {
                    console.log('[ERROR]: edit_researcher()');
                    console.log(obj.error);
                }
                grid.setLoading(false);
            },

            failure: function(response) {
                grid.setLoading(false);
                console.log('[ERROR]: edit_researcher()');
                console.log(response);
            }
        });
    }
});
