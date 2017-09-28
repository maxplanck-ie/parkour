Ext.define('Ext.ux.FileGridField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.filegridfield',

    requires: ['Ext.ux.MultiFileField'],

    store: '',
    uploadFileUrl: '',
    getFileUrl: '',

    initComponent: function() {
        var me = this;

        me.items = [{
            xtype: 'grid',
            height: 200,
            viewConfig: {
                loadMask: false
            },
            columns: {
                items: [{
                        text: 'Name',
                        dataIndex: 'name',
                        flex: 1
                    },
                    {
                        text: 'Size',
                        dataIndex: 'size',
                        width: 100,
                        renderer: function(val) {
                            var dim = '',
                                KB = 1000,
                                MB = 1000 * 1000;
                            val = parseInt(val);

                            if (val >= KB && val < MB) {
                                val = (val / KB).toFixed(2);
                                dim = ' KB';
                            } else if (val >= MB) {
                                val = (val / MB).toFixed(2);
                                dim = ' MB';
                            } else {
                                val = val.toString();
                                dim = ' bytes';
                            }

                            return val + dim;
                        }
                    },
                    {
                        width: 36,
                        dataIndex: 'path',
                        xtype: 'templatecolumn',
                        tpl: '<a href="{path}" target="_blank"><img src="/static/main-hub/resources/images/download.png"></a>'
                    },
                    {
                        xtype: 'actioncolumn',
                        width: 36,
                        align: 'center',
                        items: [{
                            icon: '/static/main-hub/resources/images/delete.png',
                            tooltip: 'Delete',
                            handler: me.deleteFile
                        }]
                    }
                ]
            },
            store: me.store,
            bbar: [
                '->',
                {
                    xtype: 'button',
                    text: 'Add files',
                    handler: function() {
                        Ext.widget({
                            xtype: 'window',
                            title: 'Upload files',
                            width: 450,
                            autoShow: true,
                            modal: true,

                            items: [{
                                xtype: 'form',
                                items: [{
                                    xtype: 'multifilefield',
                                    name: 'files',
                                    fieldLabel: 'Files',
                                    labelWidth: 50,
                                    buttonText: 'Select',
                                    allowBlank: false,
                                    width: 413,
                                    margin: 15
                                }]
                            }],
                            bbar: [
                                '->',
                                {
                                    text: 'Upload',
                                    handler: me.uploadFiles,
                                    uploadFileUrl: me.uploadFileUrl,
                                    getFileUrl: me.getFileUrl,
                                    grid: me.down('grid')
                                }
                            ]
                        });
                    }
                }
            ]
        }];

        me.callParent(arguments);
    },

    uploadFiles: function(btn) {
        var wnd = btn.up('window'),
            form = wnd.down('form').getForm(),
            uploadFileUrl = btn.uploadFileUrl,
            getFileUrl = btn.getFileUrl,
            grid = btn.grid;

        if (form.isValid()) {
            form.submit({
                url: uploadFileUrl,
                method: 'POST',
                waitMsg: 'Uploading...',
                params: Ext.JSON.encode(form.getFieldValues()),
                success: function(f, action) {
                    var obj = Ext.JSON.decode(action.response.responseText);

                    if (obj.success && obj.data.length > 0) {
                        Ext.Ajax.request({
                            url: getFileUrl,
                            method: 'GET',
                            timeout: 1000000,
                            scope: this,
                            params: {
                                'file_ids': Ext.JSON.encode(obj.data)
                            },
                            success: function(response) {
                                var obj = Ext.JSON.decode(response.responseText);

                                if (obj.success) {
                                    grid.getStore().add(obj.data);
                                } else {
                                    Ext.ux.ToastMessage(response.statusText, 'error');
                                    console.error('[ERROR]: ' + getFileUrl);
                                    console.error(response);
                                }
                            }
                        });
                    } else {
                        Ext.ux.ToastMessage(obj.message, 'error');
                    }
                    wnd.close();
                },
                failure: function(f, action) {
                    var errorMsg = (action.failureType == 'server') ? 'Server error.' : 'Error.';
                    Ext.ux.ToastMessage(errorMsg, 'error');
                    console.error('[ERROR]: ' + uploadFileUrl);
                    console.error(action.response.responseText);
                    wnd.close();
                }
            });
        } else {
            Ext.ux.ToastMessage('You did not select any file(-s)', 'warning');
        }
    },

    deleteFile: function(view, rowIndex, colIndex, item, e, record) {
        view.up().getStore().removeAt(rowIndex);
    },

    getValue: function() {
        return Ext.pluck(this.down('grid').getStore().data.items, 'id');
    }
});
