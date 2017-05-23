Ext.define('MainHub.model.indexgenerator.Record', {
    extend: 'MainHub.model.Base',

    fields: [{
            name: 'name',
            type: 'string'
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
            name: 'libraryId',
            type: 'int'
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
            name: 'recordType',
            type: 'string'
        },
        {
            name: 'sequencingDepth',
            type: 'int'
        },
        {
            name: 'libraryProtocolName',
            type: 'string'
        },

        {
            name: 'indexI7',
            type: 'string'
        },
        {
            name: 'indexI5',
            type: 'string'
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
            name: 'index_type',
            type: 'int'
        },
        {
            name: 'read_length',
            type: 'int'
        }
    ]
});
