Ext.define('MainHub.view.main.Main', {
    extend: 'Ext.container.Viewport',

    requires: [
        'Ext.list.Tree',
        'Ext.tab.Panel',
        'MainHub.view.main.MainController',
        'MainHub.view.main.MainContainerWrap',
        'MainHub.view.reports.BlankReport',
        'MainHub.store.NavigationTree'
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
            cls: 'sencha-dash-dash-headerbar shadow',
            height: 64,
            itemId: 'headerBar',
            items: [
                {
                    xtype: 'component',
                    reference: 'logo',
                    cls: 'main-logo',
                    html: '<div class="logo"><img src="static/extjs-workspace/main-hub/resources/images/logo.png">Django App</div>',
                    width: 250
                },
                {
                    margin: '0 0 0 8',
                    // ui: 'header',
                    iconCls:'x-fa fa-navicon',
                    id: 'main-navigation-btn',
                    handler: 'onToggleNavigationSize'
                },
                '->',
                // {
                //     iconCls:'x-fa fa-question',
                //     ui: 'header',
                //     href: '#faq',
                //     hrefTarget: '_self',
                //     tooltip: 'Help / FAQ\'s'
                // },
                {
                    xtype: 'tbtext',
                    cls: 'top-user-name',
                    listeners: {
                        beforerender: 'onUsernameBeforerender'
                    }
                },
                {
                    xtype: 'button',
                    text: 'Menu',
                    // iconCls:'x-fa fa-th-large',
                    // ui: 'header',
                    menu: {
                        xtype: 'menu',
                        items: [{
                            text: 'Logout',
                            // iconCls: ''
                            href: 'logout'
                        }]
                    }
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
                    width: 250,
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
