Ext.define('MainHub.model.incominglibraries.IncomingLibraries', {
    extend: 'MainHub.model.libraries.Library',

    fields: [{
            name: 'dilution_factor',
            type: 'string'
        },
        {
            name: 'concentration_facility',
            type: 'string'
        },
        {
            name: 'concentration_method_facility',
            type: 'int'
        },
        {
            name: 'dateFacility',
            type: 'string'
        },
        {
            name: 'sample_volume_facility',
            type: 'string'
        },
        {
            name: 'amount_facility',
            type: 'string'
        },
        {
            name: 'size_distribution_facility',
            type: 'string'
        },
        {
            name: 'comments_facility',
            type: 'string'
        },
        {
            name: 'qpcr_result_facility',
            type: 'string'
        },
        {
            name: 'rna_quality_facility',
            type: 'string'
        }
    ],

    getRecordType: function() {
        return (this.get('sampleId') === 0) ? 'L' : 'S';
    }
});
