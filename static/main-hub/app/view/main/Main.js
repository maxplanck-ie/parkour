Ext.define('MainHub.view.main.Main', {
    extend: 'Ext.container.Viewport',

    requires: [
        'Ext.list.Tree',
        'Ext.tab.Panel',
        'MainHub.view.main.MainController',
        'MainHub.view.main.MainContainerWrap',
        'MainHub.view.requests.Requests',
        'MainHub.view.libraries.Libraries',
        'MainHub.view.incominglibraries.IncomingLibraries',
        'MainHub.view.indexgenerator.IndexGenerator',
        'MainHub.view.librarypreparation.LibraryPreparation',
        'MainHub.view.pooling.Pooling',
        'MainHub.view.flowcell.Flowcells'
    ],

    controller: 'main',

    cls: 'sencha-dash-viewport',
    itemd: 'mainView',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    listeners: {
        render: 'onMainViewRender'
    },

    items: [
        {
            xtype: 'toolbar',
            id: 'headerBar',
            itemId: 'headerBar',
            cls: 'sencha-dash-dash-headerbar shadow',
            height: 64,
            padding: 0,
            items: [
                {
                    xtype: 'component',
                    reference: 'logo',
                    cls: 'main-logo',
                    html: '<div class="logo"><img src="static/main-hub/resources/images/logo.png">Parkour</div>',
                    width: 280
                },
                {
                    margin: '0 0 0 8',
                    // ui: 'header',
                    iconCls:'x-fa fa-navicon',
                    id: 'main-navigation-btn',
                    handler: 'onToggleNavigationSize'
                },
                '->',
                {
                    xtype: 'tbtext',
                    cls: 'top-user-name',
                    text: USERNAME      // from 'globals.html'
                },
                {
                    xtype: 'button',
                    ui: 'header',
                    id: 'adminSiteBtn',
                    iconCls: 'x-fa fa-cog',
                    href: 'admin',
                    tooltip: 'Site administration'
                },
                {
                    xtype: 'button',
                    ui: 'header',
                    iconCls: 'x-fa fa-sign-out',
                    href: 'logout',
                    tooltip: 'Logout'
                }
            ]
        },
        {
            xtype: 'maincontainerwrap',
            id: 'main-view-detail-wrap',
            reference: 'mainContainerWrap',
            flex: 1,
            items: [
                {
                    xtype: 'treelist',
                    reference: 'navigationTreeList',
                    itemId: 'navigationTreeList',
                    ui: 'navigation',
                    store: 'NavigationTree',
                    width: 280,
                    expanderFirst: false,
                    expanderOnly: false,
                    listeners: {
                        selectionchange: 'onNavigationTreeSelectionChange'
                    }
                },
                {
                    xtype: 'container',
                    flex: 1,
                    reference: 'mainCardPanel',
                    cls: 'sencha-dash-right-main-container',
                    itemId: 'contentPanel',
                    layout: {
                        type: 'card',
                        anchor: '100%'
                    }
                }
            ]
        }
    ]
});
