Ext.define('MainHub.model.tables.libraries.SampleProtocol', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'id'
        },
        {
            type: 'string',
            name: 'name'
        },
        {
            type: 'string',
            name: 'provider'
        },
        {
            type: 'string',
            name: 'catalog'
        },
        {
            type: 'string',
            name: 'explanation'
        },
        {
            type: 'string',
            name: 'inputRequirements'
        },
        {
            type: 'string',
            name: 'typicalApplication'
        },
        {
            type: 'string',
            name: 'comments'
        }
    ]
});
