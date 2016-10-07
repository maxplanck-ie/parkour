Ext.define('MainHub.store.NavigationTree', {
    extend: 'Ext.data.TreeStore',

    storeId: 'NavigationTree',

    fields: [{ name: 'text' }],

    // proxy: {
    //     type: 'ajax',
    //     url: 'get_navigation_tree/',
    //     timeout: 1000000,
    //     pageParam: false,   //to remove param "page"
    //     startParam: false,  //to remove param "start"
    //     limitParam: false,  //to remove param "limit"
    //     noCache: false,     //to remove param "_dc",
    //     reader: {
    //         type: 'json',
    //         rootProperty: 'root',
    //         successProperty: 'success'
    //     }
    // },

    // autoLoad: true,

    root: {
        expanded: true,
        children: [
            {
                text: 'Start Page',
                iconCls: 'x-fa fa-th-large',
                viewType: 'startpage',
                leaf: true
            },
            // {
            //     text: 'Dashboard',
            //     iconCls: 'x-fa fa-desktop',
            //     viewType: 'dashboard',
            //     // routeId: 'dashboard', // routeId defaults to viewType
            //     leaf: true
            // },
            // {
            //     text: 'Researchers',
            //     iconCls: 'x-fa fa-user',
            //     viewType: 'researchers',
            //     leaf: true
            // },
            {
                text: 'Submission',
                iconCls: 'x-fa fa-tasks',
                expanded: true,
                selectable: false,
                children: [
                    {
                        text: 'Requests',
                        iconCls: 'x-fa fa-external-link-square',
                        viewType: 'requests',
                        leaf: true
                    },
                    {
                        text: 'Libraries/Samples',
                        iconCls: 'x-fa fa-flask',
                        viewType: 'libraries',
                        leaf: true
                    }
                ]
            },
            {
                text: 'Approval',
                iconCls: 'x-fa fa-check-square',
                expanded: true,
                selectable: false,
                children: [
                    {
                        text: 'Incoming Libraries/Samples',
                        iconCls: 'x-fa fa-check',
                        viewType: 'incoming-libraries',
                        leaf: true
                    }
                ]
            }
        ]
    }
});
