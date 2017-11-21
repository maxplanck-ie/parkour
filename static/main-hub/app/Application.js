/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'static/main-hub/ext/packages/ux/classic/src/'
    }
});

Ext.define('MainHub.Application', {
    extend: 'Ext.app.Application',

    name: 'MainHub',

    appFolder: '/static/main-hub/app',

    stores: [
        'NavigationTree',
        'requests.Requests',
        'requests.RequestFiles',
        'libraries.Libraries',
        'libraries.LibraryProtocols',
        'libraries.LibraryTypes',
        'libraries.Organisms',
        'libraries.IndexTypes',
        'libraries.IndexI7',
        'libraries.IndexI5',
        'libraries.ConcentrationMethods',
        'libraries.ReadLengths',
        'libraries.NucleicAcidTypes',
        'libraries.RNAQuality',
        'incominglibraries.IncomingLibraries',
        'indexgenerator.PoolSizes',
        'requests.LibrariesInRequest',
        'indexgenerator.IndexGenerator',
        'librarypreparation.LibraryPreparation',
        'pooling.Pooling',
        'flowcell.Flowcells',
        'flowcell.Sequencer',
        'flowcell.Lanes',
        'flowcell.Pool',
        'flowcell.PoolInfo'
    ],

    requires: [
        'Ext.ux.ToastMessage'
    ],

    launch: function() {
        // TODO - Launch the application
    },

    onAppUpdate: function() {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function(choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});

Ext.define('MainHub.Utilities', {
    singleton: true,
    reloadAllStores: function() {
        /* Reload all loaded stores. */

        var requestsStore = Ext.getStore('requestsStore');
        if (requestsStore.isLoaded()) requestsStore.reload();

        var librariesStore = Ext.getStore('librariesStore');
        if (librariesStore.isLoaded()) librariesStore.reload();

        var incomingLibrariesStore = Ext.getStore('incomingLibrariesStore');
        if (incomingLibrariesStore.isLoaded()) incomingLibrariesStore.reload();

        var poolingTree = Ext.getStore('PoolingTree');
        if (poolingTree.isLoaded()) poolingTree.reload();

        var libraryPreparationStore = Ext.getStore('libraryPreparationStore');
        if (libraryPreparationStore.isLoaded()) libraryPreparationStore.reload();

        var poolingStore = Ext.getStore('poolingStore');
        if (poolingStore.isLoaded()) poolingStore.reload();
    },

    getDataIndex: function(e, view) {
        var xPos = e.getXY()[0];
        var columns = view.getGridColumns();
        var dataIndex;

        for (var column in columns) {
            var leftEdge = columns[column].getPosition()[0];
            var rightEdge = columns[column].getSize().width + leftEdge;

            if (xPos >= leftEdge && xPos <= rightEdge) {
                dataIndex = columns[column].dataIndex;
                break;
            }
        }

        return dataIndex;
    }
});

Ext.define('MainHub.Store', {
    singleton: true,
    save: function(storeName) {
        Ext.getStore(storeName).sync({
            success: function() {
                Ext.getStore(storeName).reload();
                new Noty({ text: 'The changes have been saved.' }).show();
            },
            failure: function(batch, options) {
                var error = batch.operations[0].getError();
                console.error(error);

                try {
                    var obj = Ext.JSON.decode(error.response.responseText);
                    if (!obj.success && obj.message && obj.message !== '') {
                        error = obj.message;
                    }
                } catch (e) {
                    error = error.statusText;
                }

                new Noty({ text: error, type: 'error' }).show();
            }
        });
    }
});

Ext.define('MainHub.grid.SearchInputMixin', {
    changeFilter: function(el, value) {
        var grid = el.up('grid');
        var store = grid.getStore();
        var columns = Ext.pluck(grid.getColumns(), 'dataIndex');

        store.clearFilter();
        store.filterBy(function(record) {
            var res = false;
            Ext.each(columns, function(column) {
                if (record.data[column] && record.data[column].toString().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    res = res || true;
                }
            });
            return res;
        });
    }
});

Ext.define('MainHub.grid.CheckboxesAndSearchInputMixin', {
    changeFilter: function(el, value) {
        var grid = el.up('grid');
        var store = grid.getStore();
        var columns = Ext.pluck(grid.getColumns(), 'dataIndex');
        var showLibraries = null;
        var showSamples = null;
        var searchQuery = null;

        if (el.itemId === 'show-libraries-checkbox') {
            showLibraries = value;
            showSamples = el.up().items.items[1].getValue();
            searchQuery = el.up('header').down('textfield').getValue();
        } else if (el.itemId === 'show-samples-checkbox') {
            showLibraries = el.up().items.items[0].getValue();
            showSamples = value;
            searchQuery = el.up('header').down('textfield').getValue();
        } else if (el.itemId === 'search-field') {
            showLibraries = el.up().down('fieldcontainer').items.items[0].getValue();
            showSamples = el.up().down('fieldcontainer').items.items[1].getValue();
            searchQuery = value;
        }

        var showFilter = Ext.util.Filter({
            filterFn: function(record) {
                var res = false;
                if (record.get('record_type') === 'Library') {
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
                        var val = record.get(column);
                        if (val && val.toString().toLowerCase().indexOf(searchQuery.toLowerCase()) > -1) {
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

Ext.define('MainHub.grid.ContextMenuMixin', {
    showContextMenu: function(gridView, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Apply to All',
                iconCls: 'x-fa fa-check-circle',
                handler: function() {
                    var dataIndex = me.getDataIndex(e, gridView);
                    me.applyToAll(record, dataIndex);
                }
            }]
        }).showAt(e.getXY());
    },

    showGroupContextMenu: function(view, node, groupId, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Select All',
                iconCls: 'x-fa fa-check-square-o',
                handler: function() {
                    me.selectUnselectAll(parseInt(groupId), true);
                }
            },
            {
                text: 'Unselect All',
                iconCls: 'x-fa fa-square-o',
                handler: function() {
                    me.selectUnselectAll(parseInt(groupId), false);
                }
            },
                '-',
            {
                text: 'QC: All selected passed',
                iconCls: 'x-fa fa-check',
                handler: function() {
                    me.qualityCheckAll(parseInt(groupId), 'passed');
                }
            },
            {
                text: 'QC: All selected failed',
                iconCls: 'x-fa fa-times',
                handler: function() {
                    me.qualityCheckAll(parseInt(groupId), 'failed');
                }
            }]
        }).showAt(e.getXY());
    },

    getDataIndex: function(e, view) {
        var xPos = e.getXY()[0];
        var columns = view.getGridColumns();
        var dataIndex;

        for (var column in columns) {
            var leftEdge = columns[column].getPosition()[0];
            var rightEdge = columns[column].getSize().width + leftEdge;

            if (xPos >= leftEdge && xPos <= rightEdge) {
                dataIndex = columns[column].dataIndex;
                break;
            }
        }

        return dataIndex;
    }
});

Ext.define('MainHub.store.SyncStoreMixin', {
    syncStore: function(storeId, reload) {
        var reload = reload || false;
        Ext.getStore(storeId).sync({
            success: function(batch) {
                var response = batch.operations[0].getResponse();
                var obj = Ext.JSON.decode(response.responseText);

                if (reload) {
                    Ext.getStore(storeId).reload();
                }

                if (obj.hasOwnProperty('message') && obj.message !== '') {
                    new Noty({ text: obj.message, type: 'warning' }).show();
                } else {
                    new Noty({ text: 'The changes have been saved.' }).show();
                }
            },

            failure: function(batch) {
                var error = batch.operations[0].getError();
                console.error(error);

                try {
                    var obj = Ext.JSON.decode(error.response.responseText);
                    if (!obj.success && obj.message && obj.message !== '') {
                        error = obj.message;
                    }
                } catch (e) {
                    error = error.statusText;
                }

                new Noty({ text: error, type: 'error' }).show();
            }
        });
    }
});

Ext.define('MainHub.grid.ResizeMixin', {
    resize: function(el) {
        el.setHeight(Ext.Element.getViewportHeight() - 64);
    }
});
