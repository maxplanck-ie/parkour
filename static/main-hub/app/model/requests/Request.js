Ext.define('MainHub.model.requests.Request', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'requestId'
        },
        {
            type: 'int',
            name: 'status'
        },
        {
            type: 'string',
            name: 'name'
        },
        {
            type: 'string',
            name: 'projectType'
        },
        {
            type: 'string',
            name: 'dateCreated'
        },
        {
            type: 'string',
            name: 'description'
        },
        {
            type: 'bool',
            name: 'termsOfUseAccept'
        },
        {
            type: 'string',
            name: 'researcher'
        }
    ]
});
