Ext.define('MainHub.model.pooling.Pooling', {
    extend: 'MainHub.model.Record',

    fields: [
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
        },
        {
            name: 'index_i7_id',
            type: 'string'
        },
        {
            name: 'index_i5_id',
            type: 'string'
        },
        {
            name: 'index_i7',
            type: 'string'
        },
        {
            name: 'index_i5',
            type: 'string'
        }
    ]
});
