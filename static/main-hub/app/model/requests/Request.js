Ext.define('MainHub.model.requests.Request', {
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
            type: 'int',
            name: 'user'
        },
        {
            type: 'string',
            name: 'user_full_name'
        },
        {
            type: 'string',
            name: 'create_time'
        },
        {
            type: 'string',
            name: 'description'
        },
        {
            type: 'bool',
            name: 'restrict_permissions'
        },
        {
            type: 'string',
            name: 'deep_seq_request_name'
        },
        {
            type: 'string',
            name: 'deep_seq_request_path'
        },
        {
            type: 'int',
            name: 'sum_seq_depth'
        }
    ]
});
