Ext.define('MainHub.model.libraries.IndexType', {
    extend: 'MainHub.model.Base',

    fields: [{
        name: 'id',
        type: 'int'
    },
    {
        name: 'name',
        type: 'string'
    },
    {
        name: 'indexReads',
        type: 'int'
    },
    {
        name: 'isDual',
        type: 'bool'
    },
    {
        name: 'indexLength',
        type: 'int'
    }
    ]
});
