Ext.define('MainHub.model.flowcell.Lane', {
    extend: 'MainHub.model.Base',

    fields: [{
            name: 'pool',
            type: 'int'
        },
        {
            name: 'poolName',
            type: 'string'
        },
        {
            name: 'lane',
            type: 'string'
        },
        {
            name: 'laneName',
            type: 'string'
        },
        {
            name: 'loaded',
            type: 'int'
        }
    ]
});
