Ext.define('MainHub.model.requests.LibrariesInRequest', {
    extend: 'MainHub.model.Record',

    fields: [{
        name: 'recordType',
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
