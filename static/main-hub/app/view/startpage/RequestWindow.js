Ext.define('MainHub.view.startpage.RequestWindow', {
    extend: 'Ext.window.Window',
    alias: 'request_wnd',
    xtype: 'request_wnd',

    requires: [
        'MainHub.view.startpage.RequestWindowController'
    ],

    controller: 'startpage-requestwindow',

    height: 515,
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
                            id: 'deepSeqRequest',
                            itemId: 'deepSeqRequest',
                            border: 0,
                            padding: '10px 0 15px 0',
                            style: {
                                borderTop: '1px solid #d0d0d0'
                            },
                            height: 185,
                            defaults: {
                                border: 0,
                                margin: '5px 0'
                            },

                            items: [
                                {
                                    html: '<strong>Deep Sequencing Request</strong><br>'
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
                                    html: '3. Upload the signed blank back using the form:<br>'
                                },
                                {
                                    layout: 'hbox',
                                    margin: '0 0 0 15px',
                                    items: [
                                        {
                                            xtype: 'form',
                                            id: 'deepSeqRequestForm',
                                            border: 0,
                                            width: 278,
                                            items: [{
                                                xtype: 'filefield',
                                                name: 'file',
                                                fieldLabel: 'File',
                                                labelWidth: 30,
                                                msgTarget: 'side',
                                                anchor: '100%',
                                                buttonText: 'Select...',
                                                allowBlank: false,
                                                onFileChange: function(button, e, value) {
                                                    var me = this,
                                                        upload = me.fileInputEl.dom,
                                                        files = upload.files,
                                                        names = [];

                                                    if (files) {
                                                        for (var i = 0; i < files.length; i++)
                                                            names.push(files[i].name);
                                                        value = names.join(', ');
                                                    }

                                                    Ext.form.field.File.superclass.setValue.call(this, value);
                                                }
                                            }]
                                        },
                                        {
                                            xtype: 'button',
                                            itemId: 'uploadBtn',
                                            text: 'Upload',
                                            margin: '0 0 0 10px'
                                        }
                                    ]
                                },
                                {
                                    id: 'uploadedDeepSeqRequest',
                                    html: 'Uploaded File: None',
                                    margin: '0 0 0 15px'
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
                    height: 415,
                    padding: '12px 15px 15px 0',

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
