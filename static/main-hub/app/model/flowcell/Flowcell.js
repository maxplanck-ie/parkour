Ext.define('MainHub.model.flowcell.Flowcell', {
    extend: 'MainHub.model.Base',

    fields: [{
        name: 'flowcellId',
        type: 'string'
    }, {
        name: 'pool',
        type: 'int'
    }, {
        name: 'laneName',
        type: 'string'
    }, {
        name: 'poolName',
        type: 'string'
    }, {
        name: 'poolSize',
        type: 'int'
    }, {
        name: 'readLengthName',
        type: 'string'
    }, {
        name: 'sequencer',
        type: 'int'
    }, {
        name: 'sequencerName',
        type: 'string'
    }, {
        name: 'loadingConcentration',
        type: 'string'
    }]
});
