Ext.define('MainHub.view.researchers.ResearcherFieldWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.researcher_field_wnd',

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
        var wnd = btn.up('researcher_field_wnd'),
            form = Ext.getCmp('addResearcherFieldForm'),
            mode = wnd.mode;

        if (form.isValid()) {
            var name = form.getForm().getFieldValues().name,
                organizationField = Ext.getCmp('organizationField'),
                organizationId = organizationField.getValue(),
                piField = Ext.getCmp('piField'),
                piId = piField.getValue();

            wnd.setLoading();
            Ext.Ajax.request({
                url: 'add_researcher_field/',
                method: 'POST',
                timeout: 1000000,
                scope: this,

                params: {
                    'mode': mode,
                    'name': name,
                    'organization_id': organizationId,
                    'pi_id': piId
                },

                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText),
                        organizationStore = Ext.getStore('organizationsStore'),
                        piStore = Ext.getStore('principalInvestigatorsStore'),
                        costUnitStore = Ext.getStore('costUnitsStore');

                    if (obj.success) {
                        if (mode == 'organization') {
                            organizationStore.load();
                        } else if (mode == 'pi') {
                            piStore.load({
                                params: {
                                    'organization_id': organizationId
                                },
                                callback: function(records, operation, success) {
                                    if (!success) Ext.ux.ToastMessage('Cannot load Principal Investigators', 'error');
                                }
                            });
                        } else if (mode == 'cost_unit') {
                            costUnitStore.load({
                                params: {
                                    'pi_id': piId
                                },
                                callback: function(records, operation, success) {
                                    if (!success) Ext.ux.ToastMessage('Cannot load Cost Units', 'error');
                                }
                            });
                        }
                        // Ext.ux.ToastMessage('Record has been added!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.log('[ERROR]: add_researcher_field(): ' + obj.error);
                        console.log(response);
                    }
                    wnd.close();
                },

                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.log('[ERROR]: add_researcher_field()');
                    console.log(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('researcher_field_wnd').close();
    }
});
