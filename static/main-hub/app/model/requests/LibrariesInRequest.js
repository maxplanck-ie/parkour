Ext.define('MainHub.model.requests.LibrariesInRequest', {
    extend: 'MainHub.model.Base',

    fields: [{
        name: 'name',
        type: 'string'
    },
    {
        name: 'recordType',
        type: 'string'
    },
    {
        name: 'barcode',
        type: 'string'
    },
    {
        name: 'libraryId',
        type: 'int'
    },
    {
        name: 'sampleId',
        type: 'int'
    }
    ]
});
