Ext.define('MainHub.view.requests.RequestWindow', {
    extend: 'Ext.window.Window',
    alias: 'request_wnd',
    xtype: 'request_wnd',

    requires: [
        'MainHub.view.requests.RequestWindowController'
    ],

    controller: 'requests-requestwindow',

    height: 500,
    width: 750,

    modal: true,
    resizable: false,

    items: [
        {
            xtype: 'container',
            layout: {
                type: 'table',
                columns: 2
            },

            items: [
                {
                    border: 0,
                    padding: 15,
                    width: 400,

                    items: [
                        {
                            xtype: 'form',
                            id: 'requestForm',
                            itemId: 'requestForm',
                            layout: 'anchor',
                            border: 0,
                            defaultType: 'textfield',
                            defaults: {
                                submitEmptyText: false,
                                anchor: '100%'
                            },

                            items: [
                                {
                                    name: 'name',
                                    id: 'requestName',
                                    fieldLabel: 'Name',
                                    emptyText: 'Name',
                                    readOnly: true,
                                    disabled: true
                                },
                                {
                                    name: 'description',
                                    xtype: 'textarea',
                                    fieldLabel: 'Description',
                                    emptyText: 'Description',
                                    allowBlank: false,
                                    height: 160
                                }
                            ]
                        },
                        {
                            id: 'piApproval',
                            itemId: 'piApproval',
                            border: 0,
                            padding: '10px 0 0 0',
                            style: {
                                borderTop: '1px solid #d0d0d0'
                            },
                            height: 162,
                            defaults: {
                                border: 0,
                                margin: '5px 0'
                            },

                            items: [
                                {
                                    html: '<strong>Personal Investigator\'s Approval</strong><br>'
                                },
                                {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    margin: '5px 0 0 0',
                                    items: [
                                        {
                                            xtype: 'label',
                                            html: '1. Download the blank:<br>',
                                            margin: '7px 15px 0 0'
                                        },
                                        {
                                            xtype: 'button',
                                            itemId: 'generatePDFBtn',
                                            text: 'Download'
                                        },
                                        {
                                            xtype: 'form',
                                            id: 'generatePDFForm',
                                            standardSubmit: true,
                                            timeout: 100000,
                                            hidden: true
                                        }
                                    ]
                                },

                                {
                                    html: '2. Sign it<br>',
                                    margin: '-3px 0px 5px 0'
                                },
                                {
                                    html: '3. Upload it back using the form:<br>'
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    id: 'librariesInRequestTable',
                    itemId: 'librariesInRequestTable',
                    title: 'Libraries/Samples',
                    width: 345,
                    height: 406,
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
                    ],

                    rowspan: 2
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
