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
            name: 'dateCreated'
        },
        {
            type: 'string',
            name: 'description'
        },
        {
            type: 'string',
            name: 'researcher'
        },
        {
            type: 'string',
            name: 'piApprovalName'
        },
        {
            type: 'string',
            name: 'piApprovalPath'
        }
    ]
});
