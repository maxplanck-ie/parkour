Ext.define('MainHub.model.libraries.Library', {
    extend: 'MainHub.model.Base',

    fields: [{
        name: 'status',
        type: 'int'
    },
    {
        name: 'requestName',
        type: 'string'
    },
    {
        name: 'requestId',
        type: 'int'
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
        name: 'name',
        type: 'string'
    },
    {
        name: 'recordType',
        type: 'string'
    },
    {
        name: 'date',
        type: 'string'
    },
    {
        name: 'library_protocol',
        type: 'int'
    },
    {
        name: 'library_protocol_name',
        type: 'string'
    },
    {
        name: 'library_type',
        type: 'int'
    },
    {
        name: 'library_type_name',
        type: 'string'
    },
    {
        name: 'amplification_cycles',
        type: 'int',
        allowNull: true
    },
    {
        name: 'organism',
        type: 'int'
    },
    {
        name: 'organism_name',
        type: 'string'
    },
    {
        name: 'index_type',
        type: 'int'
    },
    {
        name: 'index_type_name',
        type: 'string'
    },
    {
        name: 'index_reads',
        type: 'int',
        allowNull: true
    },
    {
        name: 'index_i7',
        type: 'string'
    },
    {
        name: 'index_i5',
        type: 'string'
    },
    {
        name: 'equalRepresentation',
        type: 'string'
    },
    {
        name: 'concentration',
        type: 'float'
    },
    {
        name: 'concentration_method',
        type: 'int'
    },
    {
        name: 'concentration_method_name',
        type: 'string'
    },
    {
        name: 'mean_fragment_size',
        type: 'int',
        allowNull: true
    },
    {
        name: 'qpcr_result',
        type: 'float',
        allowNull: true
    },
    {
        name: 'readLength',
        type: 'string'
    },
    {
        name: 'readLengthId',
        type: 'int'
    },
    {
        name: 'sequencing_depth',
        type: 'int'
    },
    {
        name: 'comments',
        type: 'string'
    },
    {
        name: 'barcode',
        type: 'string'
    },

    {
        name: 'nucleic_acid_type_name',
        type: 'string'
    },
    {
        name: 'nucleic_acid_type',
        type: 'int'
    },
    {
        name: 'rna_quality',
        type: 'float',
        allowNull: true,
        defaultValue: null
    }
    ],

    getRecordType: function() {
        return (this.get('sampleId') === 0) ? 'L' : 'S';
    }
});
