Ext.define('MainHub.view.tables.researchers.ResearcherWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.researcher_wnd',

    config: {
        control: {
            '#': {
                boxready: 'onResearcherWindowBoxready'
            },
            '#organizationField': {
                select: 'onOrganizationFieldSelect'
            },
            '#addOrganizationBtn': {
                click: 'onAddOrganizationBtnClick'
            },
            '#addPiBtn': {
                click: 'onAddPiBtnClick'
            },
            '#addCostUnitBtn': {
                click: 'onAddCostUnitBtnClick'
            },
            '#piField': {
                select: 'onPiFieldSelect'
            },
            '#addResearcherWndBtn': {
                click: 'onAddResearcherWndBtnClick'
            },
            '#editResearcherWndBtn': {
                click: 'onEditResearcherWndBtnClick'
            },
            '#cancelBtn': {
                click: 'onCancelBtnClick'
            }
        }
    },
    
    onResearcherWindowBoxready: function(wnd) {
        if (wnd.mode == 'add') {
            Ext.getCmp('addResearcherWndBtn').show();
        } else {
            var record = wnd.record.data,
                organizationField = Ext.getCmp('organizationField'),
                piField = Ext.getCmp('piField'),
                costUnitField = Ext.getCmp('costUnitField');
            Ext.getCmp('editResearcherWndBtn').show();
        }

        // Set form fields with researcher data
        if (wnd.mode == 'edit') {
            var form = Ext.getCmp('researcherForm').getForm();
            form.setValues({
                firstName: record.firstName,
                lastName: record.lastName,
                telephone: record.telephone,
                email: record.email
            });
        }

        // Load organizations
        wnd.setLoading();
        Ext.getStore('organizationsStore').load(function(records, operation, success) {
            if (!success || records.length == 0) {
                Ext.ux.ToastMessage('Cannot load Organizations', 'error');
            } else if (wnd.mode == 'edit') {
                organizationField.select(record.organizationId);
                organizationField.fireEvent('select', organizationField, organizationField.findRecordByValue(record.organizationId));
                piField.select(record.piId);

                // TODO: fix fields loading when Edit option is selected
                // piField.fireEvent('select', piField, piField.findRecordByValue(record.piId));
                // costUnitField.select(record.costUnitId);
            }
            wnd.setLoading(false);
        });
    },

    onOrganizationFieldSelect: function(fld, record) {
        var wnd = fld.up('researcher_wnd'),
            piStore = Ext.getStore('principalInvestigatorsStore'),
            piField = Ext.getCmp('piField'),
            costUnitField = Ext.getCmp('costUnitField'),
            addPiBtn = Ext.getCmp('addPiBtn'),
            addCostUnitBtn = Ext.getCmp('addCostUnitBtn');

        // Clear Cost Unit field
        costUnitField.clearValue();
        costUnitField.getStore().removeAll();
        costUnitField.setDisabled(true);
        addCostUnitBtn.setDisabled(true);

        // Load Principal Investigators
        wnd.setLoading();
        piStore.load({
            params: {
                'organization_id': record.data.organizationId
            },
            callback: function(records, operation, success) {
                piField.setDisabled(false);
                addPiBtn.setDisabled(false);
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Principal Investigators', 'error');
                } else if (records.length == 0) {
                    Ext.ux.ToastMessage('There are no Principal Investigators for the selected Organization', 'warning');
                }
            }
        });
        wnd.setLoading(false);
    },

    onAddOrganizationBtnClick: function() {
        Ext.create('researcher_field_wnd', {title: 'Add Organization', mode: 'organization'}).show();
    },

    onAddPiBtnClick: function() {
        Ext.create('researcher_field_wnd', {title: 'Add Principal Investigator', mode: 'pi'}).show();
    },

    onAddCostUnitBtnClick: function() {
        Ext.create('researcher_field_wnd', {title: 'Add Cost Unit', mode: 'cost_unit'}).show();
    },

    onPiFieldSelect: function(fld, record) {
        var wnd = fld.up('researcher_wnd'),
            costUnitStore = Ext.getStore('costUnitsStore'),
            costUnitField = Ext.getCmp('costUnitField'),
            addCostUnitBtn = Ext.getCmp('addCostUnitBtn');

        // Clear Cost Unit field
        costUnitField.clearValue();

        // Load Cost Units
        wnd.setLoading();
        costUnitStore.load({
            params: {
                'pi_id': record.data.piId
            },
            callback: function(records, operation, success) {
                costUnitField.setDisabled(false);
                addCostUnitBtn.setDisabled(false);
                if (!success) {
                    Ext.ux.ToastMessage('Cannot load Cost Units', 'error');
                } else if (records.length == 0) {
                    Ext.ux.ToastMessage('There are no Cost Units for the selected Principal Investigator', 'warning');
                }
            }
        });
        wnd.setLoading(false);
    },

    onAddResearcherWndBtnClick: function(btn) {
        var form = Ext.getCmp('researcherForm'),
            wnd = btn.up('researcher_wnd');

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            wnd.setLoading('Adding...');
            Ext.Ajax.request({
                url: 'add_researcher/',
                method: 'POST',
                timeout: 1000000,
                scope: this,

                params: {
                    'first_name': data.firstName,
                    'last_name': data.lastName,
                    'telephone': data.telephone,
                    'email': data.email,
                    'pi': data.pi,
                    'organization': data.organization,
                    'cost_unit': Ext.JSON.encode(data.costUnit)
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

    onEditResearcherWndBtnClick: function(btn) {
        var wnd = btn.up('researcher_wnd'),
            form = Ext.getCmp('researcherForm');

        if (form.isValid()) {
            var data = form.getForm().getFieldValues();

            wnd.setLoading('Updating...');
            Ext.Ajax.request({
                url: 'edit_researcher/',
                method: 'POST',
                timeout: 1000000,
                scope: this,
            
                params: {
                    'first_name': data.firstName,
                    'last_name': data.lastName,
                    'telephone': data.telephone,
                    'email': data.email,
                    'pi': data.pi,
                    'organization': data.organization,
                    'cost_unit': Ext.JSON.encode(data.costUnit),
                    'researcher_id': wnd.record.data.researcherId
                },
            
                success: function (response) {
                    var obj = Ext.JSON.decode(response.responseText);
            
                    if (obj.success) {
                        var grid = Ext.getCmp('researchersTable');
                        grid.fireEvent('refresh', grid);
                        Ext.ux.ToastMessage('Record has been updated!');
                    } else {
                        Ext.ux.ToastMessage(obj.error, 'error');
                        console.log('[ERROR]: edit_researcher(): ' + obj.error);
                        console.log(response);
                    }
                    wnd.close();
                },
            
                failure: function(response) {
                    Ext.ux.ToastMessage(response.statusText, 'error');
                    console.log('[ERROR]: edit_researcher()');
                    console.log(response);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('Check the form', 'warning');
        }
    },

    onCancelBtnClick: function(btn) {
        btn.up('researcher_wnd').close();
    }
});