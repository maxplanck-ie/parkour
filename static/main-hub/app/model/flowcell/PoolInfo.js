Ext.define('MainHub.model.flowcell.PoolInfo', {
    extend: 'Ext.data.Model',

    fields: [{
        name: 'request',
        type: 'string'
    }, {
        name: 'library',
        type: 'string'
    }, {
        name: 'barcode',
        type: 'string'
    }, {
        name: 'protocol',
        type: 'string'
    }, {
        name: 'pcrCycles',
        type: 'int'
    }]
});
