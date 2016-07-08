Ext.define('MainHub.model.tables.researchers.Researcher', {
    extend: 'MainHub.model.Base',

    fields: [
        {
            type: 'int',
            name: 'researcherId'
        },
        {
            type: 'string',
            name: 'firstName'
        },
        {
            type: 'string',
            name: 'lastName'
        },
        {
            type: 'string',
            name: 'phone'
        },
        {
            type: 'string',
            name: 'email'
        },
        {
            type: 'string',
            name: 'pi'
        },
        {
            type: 'string',
            name: 'organization'
        },
        {
            type: 'string',
            name: 'costUnit'
        }
    ]
});
