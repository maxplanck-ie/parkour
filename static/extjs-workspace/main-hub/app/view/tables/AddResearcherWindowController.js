Ext.define('MainHub.view.tables.AddResearcherWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.addresearcher',

    config: {
        control: {
            '#addBtn': {
                click: 'onAddBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },

    onAddBtnClick: function(btn) {
        var form = Ext.getCmp('addResearcherForm'),
            wnd = btn.up('addresearcher');

        if (form.isValid()) {
            var data = form.getValues();

            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: 'add_researcher/',
                method: 'POST',
                scope: this,

                params: {
                    'first_name': data.firstName,
                    'last_name': data.lastName,
                    'telephone': data.telephone,
                    'email': data.email,
                    'pi': data.pi,
                    'organization': data.organization,
                    'cost_unit': data.costUnit
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);

                    if (obj.success) {
                        var grid = Ext.getCmp('researchersTable');
                        grid.fireEvent('refresh', grid);
                    } else {
                        console.log('[ERROR]: add_researcher(): ' + obj.error);
                        console.log(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    console.log('[ERROR]: add_researcher()');
                    console.log(response);
                    wnd.close();
                }
            });
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('addresearcher').close();
    }
});