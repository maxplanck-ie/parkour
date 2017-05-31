Ext.define('MainHub.model.pooling.Pooling', {
    extend: 'MainHub.model.Base',

    fields: [{
        name: 'name',
        type: 'string'
    },
    {
        name: 'status',
        type: 'int'
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
        name: 'poolSize',
        type: 'string'
    },
    {
        name: 'barcode',
        type: 'string'
    },
    {
        name: 'concentration',
        type: 'float',
        allowNull: true
    },
    {
        name: 'mean_fragment_size',
        type: 'int',
        allowNull: true
    },
    {
        name: 'concentration_c1',
        type: 'float',
        allowNull: true
    },
    {
        name: 'sequencing_depth',
        type: 'int'
    },
    {
        name: 'percentage_library',
        type: 'int'
    },
    {
        name: 'file',
        type: 'string'
    }
    ]
});
