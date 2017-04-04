Ext.define('MainHub.view.startpage.RequestWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'MainHub.view.startpage.RequestWindowController',
        'MainHub.view.libraries.LibraryWindow',
        'MainHub.view.libraries.BatchAddWindow'
    ],

    controller: 'startpage-requestwindow',

    height: 445,
    width: 750,

    modal: true,
    resizable: false,

    items: [{
        xtype: 'container',
        layout: {
            type: 'table',
            columns: 2
        },
        items: [{
                border: 0,
                padding: 15,
                width: 400,
                items: [{
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
                        items: [{
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
                                height: 250
                            }
                        ]
                    },
                    {
                        id: 'uploadedDeepSeqRequest',
                        border: 0,
                        html: 'Signed Deep Sequencing Request ' +
                                '<sup><strong><span class="request-field-tooltip" tooltip-text="' +
                                  '1. Save the request.<br/>' +
                                  '2. Download the Deep Sequencing Request blank using the download button below.<br/>' +
                                  '3. Print and sign it.<br/>' +
                                  '4. Scan the blank and upload it back using the upload button below.<br/><br/>' +
                                '<strong>Note</strong>: if the blank is already uploaded, you cannot update it.' +
                              '">[?]</span></strong></sup>: <span id="uploaded-request-file">Not uploaded</span>'
                    }
                ]
            },
            {
                xtype: 'grid',
                id: 'librariesInRequestTable',
                itemId: 'librariesInRequestTable',
                title: 'Libraries/Samples',
                width: 345,
                height: 347,
                padding: '12px 15px 15px 0',
                rowspan: 2,
                columns: {
                    items: [{
                            xtype: 'rownumberer',
                            width: 40
                        },
                        {
                            text: 'Name',
                            dataIndex: 'name',
                            flex: 1
                        },
                        {
                            text: '',
                            dataIndex: 'recordType',
                            width: 35
                        },
                        {
                            text: 'Barcode',
                            dataIndex: 'barcode',
                            width: 90
                        }
                    ]
                },
                store: 'librariesInRequestStore',
                bbar: [{
                        text: 'Load from File',
                        itemId: 'loadFromFileBtn',
                        disabled: true
                    },
                    '->',
                    {
                        xtype: 'button',
                        itemId: 'batchAddBtn',
                        text: 'Batch Add'
                    },
                    {
                        text: 'Add',
                        itemId: 'addLibraryBtn'
                    }
                ]
            }
        ]
    }],

    bbar: [{
            xtype: 'button',
            id: 'downloadRequestBlankBtn',
            itemId: 'downloadRequestBlankBtn',
            text: 'Download Request Blank'
        },
        {
            xtype: 'button',
            id: 'uploadSignedBlankBtn',
            itemId: 'uploadSignedBlankBtn',
            text: 'Upload Signed Blank'
        },
        '->',
        {
            xtype: 'button',
            itemId: 'saveRequestWndBtn',
            text: 'Save'
        }
    ]
});
