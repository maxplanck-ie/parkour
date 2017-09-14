Ext.define('MainHub.model.librarypreparation.LibraryPreparation', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'requestName',
            type: 'string'
        },
        {
            name: 'poolName',
            type: 'string'
        },
        {
            name: 'selected',
            type: 'bool'
        },
        {
            name: 'sampleId',
            type: 'int'
        },
        {
            name: 'barcode',
            type: 'string'
        },
        {
            name: 'comments',
            type: 'string'
        },
        {
            name: 'libraryProtocolName',
            type: 'string'
        },
        {
            name: 'libraryProtocol',
            type: 'int'
        },
        {
            name: 'concentration_sample',
            type: 'float'
        },
        {
            name: 'starting_amount',
            type: 'float',
            allowNull: true
        },
        {
            name: 'starting_volume',
            type: 'float',
            allowNull: true
        },
        {
            name: 'spike_in_description',
            type: 'string'
        },
        {
            name: 'spike_in_volume',
            type: 'float',
            allowNull: true
        },
        {
            name: 'indexI7Id',
            type: 'string'
        },
        {
            name: 'indexI5Id',
            type: 'string'
        },
        {
            name: 'pcr_cycles',
            type: 'int',
            allowNull: true
        },
        {
            name: 'concentration_library',
            type: 'float',
            allowNull: true
        },
        {
            name: 'mean_fragment_size',
            type: 'int',
            allowNull: true
        },
        {
            name: 'nM',
            type: 'float',
            allowNull: true
        },
        {
            name: 'dilution_factor',
            type: 'int',
            allowNull: true
        }
    ]
});
