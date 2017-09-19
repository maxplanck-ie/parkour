Ext.define('MainHub.model.flowcell.PoolInfo', {
    extend: 'Ext.data.Record',

    fields: [{
        name: 'request',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'protocol',
        type: 'string'
    }, {
        name: 'pcrCycles',
        type: 'int'
    }]
});
