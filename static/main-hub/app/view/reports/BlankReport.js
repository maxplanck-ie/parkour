Ext.define('MainHub.view.reports.BlankReport', {
    extend: 'Ext.container.Container',
    xtype: 'reportblank',

    requires: [],

    anchor : '100% -1',

    layout:{
        type:'vbox',
        pack:'center',
        align:'center'
    },

    items: [
        {
            xtype: 'box',
            cls: 'blank-page-container',
            html: '<div class=\'fa-outer-class\'><span class=\'x-fa fa-clock-o\'></span></div><h1>Coming Soon!</h1><span class=\'blank-page-text\'>Stay tuned for updates</span>'
        }
    ]
});
