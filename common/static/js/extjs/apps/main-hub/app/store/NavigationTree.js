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
                text: 'Dashboard',
                iconCls: 'x-fa fa-desktop',
                rowCls: 'nav-tree-badge nav-tree-badge-new',
                viewType: 'dashboard',
                // routeId: 'dashboard', // routeId defaults to viewType
                leaf: true
            },
            {
                text: 'Reports',
                iconCls: 'x-fa fa-leanpub',
                expanded: false,
                selectable: false,
                //routeId: 'pages-parent',
                //id: 'pages-parent',

                children: [
                    {
                        text: 'Blank Report',
                        iconCls: 'x-fa fa-file-o',
                        viewType: 'reportblank',
                        leaf: true
                    }
                ]
            }
        ]
    }
});
