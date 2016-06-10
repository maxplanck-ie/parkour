Ext.define('MainHub.view.tables.researchers.ResearchersController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.researchers',

    config: {
        control: {
            '#researchersTable': {
                boxready: 'onResearchersTableBoxready',
                edit: 'onResearcherEdit',
                refresh: 'onResearchersTableRefresh'
            },
            '#addResearcherBtn': {
                click: 'onAddResearcherBtnClick'
            }
        }
    },

    onResearchersTableRefresh: function(grid) {
        grid.getStore().removeAll();    // Clear the table before refreshing

        grid.setLoading(true);
        Ext.Ajax.request({
            url: 'get_researchers/',
            method: 'POST',
            timeout: 1000000,
            scope: this,

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var store = Ext.create('MainHub.store.Researchers', {
                        data: obj.data
                    });
    
                    grid.setStore(store);
                    grid.down('pagingtoolbar').bindStore(store);
                    store.loadPage(1);
                    grid.setLoading(false);
                } else {
                    grid.setLoading(false);
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.log('[ERROR]: get_researchers()');
                    console.log(response);
                }
            },

            failure: function(response) {
                grid.setLoading(false);
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.log('[ERROR]: get_researchers()');
                console.log(response);
            }
        });
    },

    onResearchersTableBoxready: function(grid) {
        grid.fireEvent('refresh', grid);
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
                    Ext.ux.ToastMessage('Record has been updated!');
                    grid.setLoading(false);
                } else {
                    grid.setLoading(false);
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.log('[ERROR]: edit_researcher(): ' + obj.error);
                    console.log(response);
                }
            },

            failure: function(response) {
                grid.setLoading(false);
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.log('[ERROR]: edit_researcher()');
                console.log(response);
            }
        });
    },

    onAddResearcherBtnClick: function(btn) {
        Ext.create('addresearcher').show();
    }
});
