Ext.define('MainHub.view.tables.researchers.AddResearcherWindowController', {
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
                        Ext.ux.ToastMessage('Record has been added!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.log('[ERROR]: add_researcher(): ' + obj.error);
                        console.log(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.log('[ERROR]: add_researcher()');
                    console.log(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('addresearcher').close();
    }
});