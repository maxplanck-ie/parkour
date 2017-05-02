Ext.define('MainHub.model.incominglibraries.IncomingLibraries', {
    extend: 'MainHub.model.libraries.Library',
    fields: [
        {
            name: 'dilution_factor',
            type: 'int'
        },
        {
            name: 'concentration_facility',
            type: 'float',
            allowNull: true
        },
        {
            name: 'concentration_method_facility',
            type: 'int'
        },
        // {
        //     name: 'dateFacility',
        //     type: 'string'
        // },
        {
            name: 'sample_volume_facility',
            type: 'int',
            allowNull: true
        },
        {
            name: 'amount_facility',
            type: 'float',
            allowNull: true
        },
        {
            name: 'size_distribution_facility',
            type: 'float',
            allowNull: true
        },
        {
            name: 'qpcr_result_facility',
            type: 'float',
            allowNull: true
        },
        {
            name: 'rna_quality_facility',
            type: 'float',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'comments_facility',
            type: 'string'
        },
        {
            name: 'qc_result',
            type: 'int',
            allowNull: true
            // defaultValue: null
        }
    ],

    getRecordType: function() {
        return (this.get('sampleId') === 0) ? 'L' : 'S';
    }
});
