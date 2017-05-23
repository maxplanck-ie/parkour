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

    launch: function () {
        // TODO - Launch the application
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
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
    }
});
