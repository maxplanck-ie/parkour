Ext.define('MainHub.model.researchers.Organization', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'organizationId'
        },
        {
            type: 'string',
            name: 'name'
        }
    ]
});
