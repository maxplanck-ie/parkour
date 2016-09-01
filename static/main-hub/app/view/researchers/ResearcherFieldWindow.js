Ext.define('MainHub.view.researchers.ResearcherFieldWindow', {
    extend: 'Ext.window.Window',
    alias: 'researcher_field_wnd',
    xtype: 'researcher_field_wnd',

    requires: ['MainHub.view.researchers.ResearcherFieldWindowController'],

    controller: 'researcher_field_wnd',

    height: 155,
    width: 350,

    modal: true,
    resizable: false,

    items: [
        {
            xtype: 'form',
            id: 'addResearcherFieldForm',
            layout: 'anchor',
            border: 0,
            padding: 15,

            items: [{
                xtype: 'textfield',
                anchor: '100%',
                name: 'name',
                fieldLabel: 'Name',
                emptyText: 'Name',
                labelWidth: 60,
                allowBlank: false,
                submitEmptyText: false
            }]
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
            itemId: 'addBtn',
            text: 'Add'
        }
    ]
});
