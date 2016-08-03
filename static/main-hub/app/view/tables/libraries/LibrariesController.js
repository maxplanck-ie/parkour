Ext.define('MainHub.view.tables.libraries.LibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.tables-libraries-libraries',
    
    config: {
        control: {
            '#librariesTable': {
                boxready: 'onLibrariesTableBoxready',
                refresh: 'onLibrariesTableRefresh',
                itemcontextmenu: 'onLibrariesTableItemContextMenu'
            },
            
            '#addLibraryBtn': {
                click: 'onAddLibraryBtnClick'
            }
        }
    },

    onLibrariesTableBoxready: function(grid) {
        // Triggers when the table is shown for the first time
        grid.fireEvent('refresh', grid);
    },

    onLibrariesTableRefresh: function(grid) {
        // Reload the table
        grid.getStore().removeAll();
        grid.getStore().reload();
    },
    
    onAddLibraryBtnClick: function(btn) {
        Ext.create('library_wnd', {title: 'Add Library/Sample', mode: 'add'}).show();
    },

    onLibrariesTableItemContextMenu: function(grid, record, item, index, e) {
        var me = this;

        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: 'Edit',
                    iconCls: 'x-fa fa-pencil',
                    handler: function() {
                        me.editRecord(record)
                    }
                },
                {
                    text: 'Delete',
                    iconCls: 'x-fa fa-trash',
                    handler: function() {
                        Ext.Msg.show({
                            title: 'Delete record',
                            message: 'Are you sure you want to delete this record?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            fn: function(btn) {
                                if (btn == 'yes') me.deleteRecord(record);
                            }
                        });
                    }
                }
            ]
        }).showAt(e.getXY());
    },

    editRecord: function(record) {
        Ext.create('library_wnd', {
            title: record.data.recordType == 'L' ? 'Edit Library' : 'Edit Sample',
            mode: 'edit', record: record
        }).show();
    },

    deleteRecord: function(record) {
        var url = record.data.recordType == 'L' ? 'delete_library/' : 'delete_sample/';

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            timeout: 1000000,
            scope: this,

            params: {
                'record_id': record.data.id,
                'record_type': record.data.recordType
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var grid = Ext.getCmp('librariesTable');
                    grid.fireEvent('refresh', grid);
                    Ext.ux.ToastMessage('Record has been deleted!');

                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.log('[ERROR]: ' + url.replace('/', '()'));
                    console.log(response);
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.log('[ERROR]: ' + + url.replace('/', '()'));
                console.log(response);
            }
        });
    }
});
