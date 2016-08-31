Ext.define('MainHub.view.tables.requests.RequestWindow', {
    extend: 'Ext.window.Window',
    alias: 'request_wnd',
    xtype: 'request_wnd',

    requires: ['MainHub.view.tables.requests.RequestWindowController'],

    controller: 'request_wnd',

    height: 380,
    width: 650,

    modal: true,
    resizable: false,

    items: [
        {
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'form',
                    id: 'requestForm',
                    itemId: 'requestForm',
                    layout: 'anchor',
                    border: 0,
                    padding: 15,
                    width: 400,

                    defaultType: 'textfield',
                    defaults: {
                        submitEmptyText: false,
                        anchor: '100%'
                    },

                    items: [
                        {
                            name: 'status',
                            xtype: 'numberfield',
                            fieldLabel: 'Status',
                            emptyText: 'Status',
                            minValue: 0,
                            maxValue: 10,
                            allowBlank: false,
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false
                        },
                        {
                            name: 'name',
                            fieldLabel: 'Name',
                            emptyText: 'Name',
                            allowBlank: false
                        },
                        {
                            name: 'projectType',
                            fieldLabel: 'Project Type',
                            emptyText: 'Project Type',
                            allowBlank: false
                        },
                        {
                            name: 'description',
                            xtype: 'textarea',
                            fieldLabel: 'Description',
                            emptyText: 'Description',
                            allowBlank: false
                        },
                        {
                            name: 'termsOfUseAccept',
                            xtype: 'checkboxfield',
                            boxLabel: 'Terms of Use (accept)'
                        }
                    ]
                },
                {
                    xtype: 'container',
                    padding: '25px 15px 0 0',
                    items: [
                        {
                            xtype: 'label',
                            text: 'Researcher:',
                            style: {
                                // color: '#cecece',
                                fontWeight: 400
                            }
                        },
                        {
                            xtype: 'grid',
                            id: 'researchersInRequestWindow',
                            width: 245,
                            height: 242,
                            padding: '15px 15px 15px 0',

                            columns: {
                                items: [
                                    { text: 'First name', dataIndex: 'firstName', flex: 1 },
                                    { text: 'Last name', dataIndex: 'lastName', flex: 1 }
                                ]
                            },

                            tbar: [
                                {
                                    xtype: 'textfield',
                                    itemId: 'searchField',
                                    emptyText: 'Search',
                                    width: 212
                                }
                            ]
                        }
                    ]
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
            itemId: 'addRequestWndBtn',
            id: 'addRequestWndBtn',
            text: 'Add',
            hidden: true
        },
        {
            xtype: 'button',
            itemId: 'editRequestWndBtn',
            id: 'editRequestWndBtn',
            text: 'Update',
            hidden: true
        }
    ]
});
