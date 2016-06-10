Ext.define('MainHub.view.tables.requests.AddRequestWindow', {
    extend: 'Ext.window.Window',
    alias: 'add_request',
    xtype: 'add_request',

    requires: ['MainHub.view.tables.requests.AddRequestWindowController'],

    controller: 'add_request',

    title: 'Add Request',
    height: 370,
    width: 600,

    modal: true,
    resizable: false,

    items: [
        {
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'form',
                    id: 'addRequestForm',
                    itemId: 'addRequestForm',
                    layout: 'anchor',
                    border: 0,
                    padding: 15,
                    width: 350,

                    defaultType: 'textfield',
                    defaults: {
                        submitEmptyText: false,
                        anchor: '100%'
                    },

                    items: [
                        {
                            name: 'status',
                            emptyText: 'Status',
                            allowBlank: false
                        },
                        {
                            name: 'name',
                            emptyText: 'Name',
                            allowBlank: false
                        },
                        {
                            name: 'projectType',
                            emptyText: 'Project Type',
                            allowBlank: false
                        },
                        {
                            name: 'description',
                            xtype: 'textarea',
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
                    padding: '15px 15px 0 0',
                    items: [
                        {
                            xtype: 'label',
                            text: 'Researcher',
                            style: {
                                // color: '#cecece',
                                fontWeight: 400
                            }
                        },
                        {
                            xtype: 'grid',
                            id: 'researchersInAddRequestTable',
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
            itemId: 'addBtn',
            text: 'Add'
        }
    ]
});