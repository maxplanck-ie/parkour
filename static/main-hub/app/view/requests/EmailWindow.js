Ext.define('MainHub.view.requests.EmailWindow', {
    extend: 'Ext.window.Window',
    requires: ['MainHub.view.requests.EmailWindowController'],
    controller: 'requests-emailwindow',

    height: 320,
    width: 400,
    modal: true,
    resizable: false,
    autoShow: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [{
        xtype: 'form',
        itemId: 'email-form',
        padding: 10,
        border: 0,
        defaults: {
            submitEmptyText: false,
            allowBlank: false,
            labelWidth: 100,
            anchor: '100%'
        },
        items: [{
                xtype: 'textfield',
                name: 'subject',
                fieldLabel: 'Subject',
                emptyText: 'Subject'
            },
            {
                xtype: 'textarea',
                name: 'message',
                fieldLabel: 'Message',
                emptyText: 'Message',
                height: 125
            },
            {
                xtype: 'fieldcontainer',
                defaultType: 'checkboxfield',
                name: 'include_failed_records',
                items: [{
                    boxLabel: 'Include the list of all failed libraries and samples',
                    name: 'include_failed_records',
                    inputValue: 'true',
                    checked: false
                }]
            }
        ]
    }],

    bbar: [
        '->',
        {
            xtype: 'button',
            itemId: 'sendEmail',
            iconCls: 'fa fa-paper-plane fa-lg',
            text: 'Send'
        }
    ]
});
