Ext.define('MainHub.model.pooling.Pooling', {
    extend: 'MainHub.model.Base',

    fields: [{
            name: 'name',
            type: 'string'
        },
        {
            name: 'active',
            type: 'bool'
        },
        {
            name: 'libraryId',
            type: 'int'
        },
        {
            name: 'sampleId',
            type: 'int'
        },
        {
            name: 'requestId',
            type: 'int'
        },
        {
            name: 'requestName',
            type: 'string'
        },
        {
            name: 'poolId',
            type: 'int'
        },
        {
            name: 'poolName',
            type: 'string'
        },
        {
            name: 'barcode',
            type: 'string'
        },
        {
            name: 'concentration',
            type: 'float'
        },
        {
            name: 'meanFragmentSize',
            type: 'int'
        },
        {
            name: 'concentrationC1',
            type: 'string'
        },
        {
            name: 'concentrationC2',
            type: 'string'
        },
        {
            name: 'sequencingDepth',
            type: 'int'
        },
        {
            name: 'sampleVolume',
            type: 'string'
        },
        {
            name: 'bufferVolume',
            type: 'string'
        },
        {
            name: 'percentageLibrary',
            type: 'string'
        },
        {
            name: 'volumeToPool',
            type: 'string'
        },
        {
            name: 'file',
            type: 'string'
        }
    ]
});
