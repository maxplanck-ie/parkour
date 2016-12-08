Ext.define('MainHub.view.main.Main', {
    extend: 'Ext.container.Viewport',

    requires: [
        'Ext.list.Tree',
        'Ext.tab.Panel',
        'MainHub.view.main.MainController',
        'MainHub.view.main.MainContainerWrap',
        'MainHub.view.reports.BlankReport',
        'MainHub.view.startpage.Startpage',
        // 'MainHub.view.researchers.Researchers',
        'MainHub.view.libraries.Libraries',
        'MainHub.view.qualitycontrol.IncomingLibraries',
        'MainHub.view.indexgenerator.IndexGenerator',
        'MainHub.view.pooling.LibraryPreparation',
        'MainHub.view.pooling.Pooling',
        'MainHub.view.flowcell.LoadFlowcells'
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
                    width: 320
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
                    width: 320,
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
