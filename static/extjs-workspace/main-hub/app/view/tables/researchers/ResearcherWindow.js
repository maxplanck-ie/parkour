Ext.define('MainHub.view.tables.researchers.ResearcherWindow', {
    extend: 'Ext.window.Window',
    alias: 'researcher_wnd',
    xtype: 'researcher_wnd',

    requires: ['MainHub.view.tables.researchers.ResearcherWindowController'],

    controller: 'researcher_wnd',

    height: 445,
    width: 400,

    modal: true,
    resizable: false,

    items: [
        {
            xtype: 'form',
            id: 'researcherForm',
            itemId: 'researcherForm',
            layout: 'anchor',
            border: 0,
            padding: 15,

            defaultType: 'textfield',
            defaults: {
                submitEmptyText: false,
                anchor: '100%'
            },

            items: [
                {
                    name: 'firstName',
                    fieldLabel: 'First name',
                    emptyText: 'First name',
                    allowBlank: false
                },
                {
                    name: 'lastName',
                    fieldLabel: 'Last name',
                    emptyText: 'Last name',
                    allowBlank: false
                },
                {
                    name: 'telephone',
                    fieldLabel: 'Telephone',
                    emptyText: 'Telephone',
                    allowBlank: false
                },
                {
                    name: 'email',
                    fieldLabel: 'Email',
                    emptyText: 'Email',
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    name: 'pi',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'piId',
                    fieldLabel: 'Principal Investigator',
                    emptyText: 'Principal Investigator',
                    store: 'principalInvestigatorsStore',
                    allowBlank: false
                },
                {
                    xtype: 'combobox',
                    name: 'organization',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'organizationId',
                    fieldLabel: 'Organization',
                    emptyText: 'Organization',
                    store: 'organizationsStore',
                    allowBlank: false
                },
                {
                    xtype: 'tagfield',
                    name: 'costUnit',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'costUnitId',
                    fieldLabel: 'Cost Unit',
                    store: 'costUnitsStore',
                    allowBlank: false
                }
            ]
        }
    ],

    bbar: [
        '->',
        {
            xtype: 'button',
            itemId: 'cancelBtn',
            text: 'Cancel'
        },
        {
            xtype: 'button',
            itemId: 'addResearcherWndBtn',
            id: 'addResearcherWndBtn',
            text: 'Add',
            hidden: true
        },
        {
            xtype: 'button',
            itemId: 'editResearcherWndBtn',
            id: 'editResearcherWndBtn',
            text: 'Update',
            hidden: true
        }
    ]
});