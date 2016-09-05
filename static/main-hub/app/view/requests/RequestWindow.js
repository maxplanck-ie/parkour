Ext.define('MainHub.view.requests.RequestWindow', {
    extend: 'Ext.window.Window',
    alias: 'request_wnd',
    xtype: 'request_wnd',

    requires: [
        'MainHub.view.requests.RequestWindowController'
    ],

    controller: 'requests-requestwindow',

    height: 445,
    width: 750,

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
                            allowBlank: false,
                            height: 150
                        },
                        {
                            name: 'termsOfUseAccept',
                            xtype: 'checkboxfield',
                            boxLabel: 'Terms of Use (accept)'
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    id: 'librariesInRequestTable',
                    title: 'Libraries/Samples',
                    width: 345,
                    height: 350,
                    padding: '15px 15px 15px 0',

                    columns: {
                        items: [
                            { xtype: 'rownumberer', width: 40 },
                            { text: 'Name', dataIndex: 'name', flex: 1 },
                            { text: '', dataIndex: 'recordType', width: 35 },
                            { text: 'Barcode', dataIndex: 'barcode', width: 90 }
                        ]
                    },

                    store: 'librariesInRequestStore',

                    bbar: [
                        {
                            text: 'Load from File',
                            itemId: 'loadFromFileBtn',
                            disabled: true
                        },
                        '->',
                        {
                            text: 'Add',
                            itemId: 'addLibraryBtn'
                        }
                    ]
                }
            ]
        }
    ],

    buttons: [
        '->',
        {
            xtype: 'button',
            itemId: 'cancelBtn',
            text: 'Cancel'
        },
        {
            xtype: 'button',
            itemId: 'saveRequestWndBtn',
            text: 'Save'
        }
    ]
});
