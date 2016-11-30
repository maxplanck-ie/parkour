Ext.define('MainHub.view.libraries.LibrariesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.libraries-libraries',

    config: {
        control: {
            '#librariesTable': {
                boxready: 'onLibrariesTableBoxready',
                refresh: 'onLibrariesTableRefresh',
                itemcontextmenu: 'onLibrariesTableItemContextMenu'
            },
            '#showLibrariesCheckbox': {
                change: 'onFilterChange'
            },
            '#showSamplesCheckbox': {
                change: 'onFilterChange'
            },
            '#searchField': {
                change: 'onFilterChange'
            }
        }
    },

    onLibrariesTableBoxready: function(grid) {
        // Triggers when the table is shown for the first time
        grid.fireEvent('refresh', grid);
    },

    onLibrariesTableRefresh: function(grid) {
        // Reload the table
        grid.getStore().reload();
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
                        me.editRecord(record);
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
                'record_id': record.data.recordType == 'L' ? record.data.libraryId : record.data.sampleId
            },

            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);

                if (obj.success) {
                    var grid = Ext.getCmp('librariesTable');
                    grid.fireEvent('refresh', grid);
                    Ext.ux.ToastMessage('Record has been deleted!');

                    // Reload stores
                    if (Ext.getStore('requestsStore').isLoaded()) Ext.getStore('requestsStore').reload();
                    if (Ext.getStore('incomingLibrariesStore').isLoaded()) Ext.getStore('incomingLibrariesStore').reload();
                    if (Ext.getStore('PoolingTree').isLoaded()) Ext.getStore('PoolingTree').reload();
                    if (Ext.getStore('libraryPreparationStore')) Ext.getStore('libraryPreparationStore').reload();
                    if (Ext.getStore('poolingStore').isLoaded()) Ext.getStore('poolingStore').reload();
                } else {
                    Ext.ux.ToastMessage(obj.error, 'error');
                    console.error('[ERROR]: ' + url.replace('/', '()'));
                    console.error(response);
                }
            },

            failure: function(response) {
                Ext.ux.ToastMessage(response.statusText, 'error');
                console.error('[ERROR]: ' + url.replace('/', '()'));
                console.error(response);
            }
        });
    },

    onFilterChange: function(el, value) {
        var grid = Ext.getCmp('librariesTable'),
            store = grid.getStore(),
            columns = Ext.pluck(grid.getColumns(), 'dataIndex'),
            showLibraries = null,
            showSamples = null,
            searchQuery = null;

        if (el.itemId == 'showLibrariesCheckbox') {
            showLibraries = value;
            showSamples = el.up().items.items[1].getValue();
            searchQuery = el.up('header').down('textfield').getValue();
        } else if (el.itemId == 'showSamplesCheckbox') {
            showLibraries = el.up().items.items[0].getValue();
            showSamples = value;
            searchQuery = el.up('header').down('textfield').getValue();
        } else if (el.itemId == 'searchField') {
            showLibraries = el.up().down('fieldcontainer').items.items[0].getValue();
            showSamples = el.up().down('fieldcontainer').items.items[1].getValue();
            searchQuery = value;
        }

        var showFilter = Ext.util.Filter({
            filterFn: function(record) {
                var res = false;
                if (record.get('recordType') == 'L') {
                    res = res || showLibraries;
                } else {
                    res = res || showSamples;
                }
                return res;
            }
        });

        var searchFilter = Ext.util.Filter({
            filterFn: function(record) {
                var res = false;
                if (searchQuery) {
                    Ext.each(columns, function(column) {
                        if (record.data[column].toLowerCase().indexOf(searchQuery.toLowerCase()) > -1) {
                            res = res || true;
                        }
                    });
                } else {
                    res = true;
                }
                return res;
            }
        });

        store.clearFilter();
        store.filter([showFilter, searchFilter]);
    }
});
