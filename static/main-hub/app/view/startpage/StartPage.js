Ext.define('MainHub.view.startpage.StartPage', {
    extend: 'Ext.container.Container',
    xtype: 'startpage',

    requires: [
        'Ext.container.Container'
    ],

    anchor : '100% -1',

    layout:{
        type:'hbox',
        pack:'center',
        align:'center'
    },

    items: [
        {
            xtype: 'box',
            html: '<p>Researchers</p>',
            width: 100,
            height: 100,
            margin: 15,
            style: {
                border: '1px solid #ccc'
            }
        }
        // {
        //     xtype: 'box',
        //     html: '<h1>Box 2</h1>',
        //     width: 100,
        //     height: 100,
        //     margin: 15,
        //     style: {
        //         border: '1px solid #ccc'
        //     }
        // }
    ]
});
