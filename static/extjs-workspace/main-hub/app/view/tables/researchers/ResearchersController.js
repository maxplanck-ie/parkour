Ext.define('MainHub.view.tables.researchers.ResearchersController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.researchers',

    config: {
        control: {
            '#researchersTable': {
                edit: 'onResearcherEdit',
                boxready: 'onResearchersTableRefresh',
                refresh: 'onResearchersTableRefresh',
                itemcontextmenu: 'onResearchersTableItemContextMenu'
            },
            '#addResearcherBtn': {
                click: 'onAddResearcherBtnClick'
            },
            "#searchField": {
                change: 'onSearchFieldChange'
            }
        }
    },

    onResearchersTableRefresh: function(grid) {
        grid.getStore().removeAll();
        grid.getStore().reload();
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
        Ext.create('researcher_wnd', {title: 'Add Researcher', mode: 'add'}).show();
    },
    
    onSearchFieldChange: function(fld, newValue) {
        var grid = Ext.getCmp('researchersTable'),
            store = grid.getStore(),
            columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column].toLowerCase().indexOf(newValue.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });

        grid.setHeight(Ext.Element.getViewportHeight() - 64);
    },

    onResearchersTableItemContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: 'Edit',
                    iconCls: 'x-fa fa-pencil',
                    handler: function() {
                        me.editResearcher(record)
                    }
                },
                {
                    text: 'Delete',
                    iconCls: 'x-fa fa-trash',
                    handler: function() {
                        Ext.Msg.show({
                            title: 'Delete researcher',
                            message: 'Are you sure you want to delete the researcher?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            fn: function(btn) {
                                if (btn == 'yes') me.deleteResearcher(record);
                            }
                        });
                    }
                }
            ]
        }).showAt(e.getXY());
    },

    editResearcher: function(record) {
        Ext.create('researcher_wnd', {title: 'Edit Researcher', mode: 'edit', record: record}).show();
    },

    deleteResearcher: function(record) {
        Ext.Ajax.request({
            url: 'delete_researcher/',
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                'researcher_id': record.data.researcherId
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var grid = Ext.getCmp('researchersTable');
                    grid.fireEvent('refresh', grid);
                    Ext.ux.ToastMessage('Record has been deleted!');

                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.log('[ERROR]: delete_researcher()');
                    console.log(response);
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.log('[ERROR]: delete_researcher()');
                console.log(response);
            }
        });
    }
});
