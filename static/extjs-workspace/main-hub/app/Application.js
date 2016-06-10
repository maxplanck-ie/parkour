/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */

Ext.Loader.setConfig({
    enabled : true,
    disableCaching : true, // For debug only
    paths : {
        'Ext.ux': '/static/extjs-workspace/packages/ux'
    }
});

Ext.define('MainHub.Application', {
    extend: 'Ext.app.Application',
    
    name: 'MainHub',

    appFolder: '/static/extjs-workspace/main-hub/app',

    stores: [
        'NavigationTree',
        'Researchers',
        'Requests'
    ],

    requires: [
        'Ext.ux.ToastMessage'
    ],

    controllers: [],
    
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
