Ext.define('MainHub.model.requests.LibrariesInRequest', {
    extend: 'MainHub.model.Record',

    fields: [
        {
            name: 'barcode',
            type: 'string'
        },
        {
            name: 'record_type',
            type: 'string'
        },
        {
            name: 'library_id',
            type: 'int'
        },
        {
            name: 'sample_id',
            type: 'int'
        }
    ]
});
