Ext.define('MainHub.view.tables.researchers.ResearcherWindow', {
    extend: 'Ext.window.Window',
    alias: 'researcher_wnd',
    xtype: 'researcher_wnd',

    requires: ['MainHub.view.tables.researchers.ResearcherWindowController'],

    controller: 'researcher_wnd',

    height: 420,
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
                    name: 'pi',
                    fieldLabel: 'Principal Investigator',
                    emptyText: 'Principal Investigator',
                    allowBlank: false
                },
                {
                    name: 'organization',
                    fieldLabel: 'Organization',
                    emptyText: 'Organization',
                    allowBlank: false
                },
                {
                    name: 'costUnit',
                    fieldLabel: 'Cost Unit',
                    emptyText: 'Cost Unit',
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