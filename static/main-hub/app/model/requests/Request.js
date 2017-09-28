Ext.define('MainHub.model.requests.Request', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'requestId'
        },
        {
            type: 'bool',
            name: 'restrictPermissions'
        },
        {
            type: 'string',
            name: 'name'
        },
        {
            type: 'string',
            name: 'date'
        },
        {
            type: 'string',
            name: 'description'
        },
        {
            type: 'string',
            name: 'user'
        },
        {
            type: 'string',
            name: 'deepSeqRequestName'
        },
        {
            type: 'string',
            name: 'deepSeqRequestPath'
        },
        {
            type: 'int',
            name: 'sumSeqDepth'
        }
    ]
});
