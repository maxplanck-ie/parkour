/*
 * This file is generated and updated by Sencha Cmd. You can edit this file as
 * needed for your application, but these edits will have to be merged by
 * Sencha Cmd when upgrading.
 */
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'MainHub': '/static/js/extjs/apps/main-hub',
        'MainHub.view.main.Main': '/static/js/extjs/apps/main-hub/app/view/main/Main.js',
        'MainHub.view.main.MainModel': '/static/js/extjs/apps/main-hub/app/view/main/MainModel.js',
        'MainHub.view.main.MainController': '/static/js/extjs/apps/main-hub/app/view/main/MainController.js',
        'MainHub.view.main.List': '/static/js/extjs/apps/main-hub/app/view/main/List.js',
        'MainHub.store.Personnel': '/static/js/extjs/apps/main-hub/app/store/Personnel.js'
    }
});

Ext.application({
    name: 'MainHub',

    appFolder: '/static/js/extjs/apps/main-hub/app',

    extend: 'MainHub.Application',

    requires: [
        'MainHub.view.main.Main',
        'MainHub.view.main.MainModel',
        'MainHub.view.main.MainController',
        'MainHub.view.main.List',
        'MainHub.store.Personnel'
    ],

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
    mainView: 'MainHub.view.main.Main'

    //-------------------------------------------------------------------------
    // Most customizations should be made to MainHub.Application. If you need to
    // customize this file, doing so below this section reduces the likelihood
    // of merge conflicts when upgrading to new versions of Sencha Cmd.
    //-------------------------------------------------------------------------
});
