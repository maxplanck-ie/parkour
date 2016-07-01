Ext.define('MainHub.store.NavigationTree', {
    extend: 'Ext.data.TreeStore',

    storeId: 'NavigationTree',

    fields: [{
        name: 'text'
    }],

    root: {
        expanded: true,
        children: [
            {
                text: 'Start Page',
                iconCls: 'x-fa fa-th-large',
                viewType: 'startpage',
                leaf: true
            },
            {
                text: 'Dashboard',
                iconCls: 'x-fa fa-desktop',
                viewType: 'dashboard',
                // routeId: 'dashboard', // routeId defaults to viewType
                leaf: true
            },
            {
                text: 'Tables',
                iconCls: 'x-fa fa-table',
                expanded: true,
                selectable: false,
                children: [
                    {
                        text: 'Researchers',
                        iconCls: 'x-fa fa-user',
                        viewType: 'researchers',
                        leaf: true
                    },
                    {
                        text: 'Requests',
                        iconCls: 'x-fa fa-external-link-square',
                        viewType: 'requests',
                        leaf: true
                    }
                ]
            }
        ]
    }
});
